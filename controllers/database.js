const mongoose = require('mongoose');
const parser = require('body-parser');
const hash = require('password-hash');


mongoose.set('useFindAndModify', false);
const mongoUrl = 'mongodb://admin:admin@cluster0-shard-00-00-ryrmi.mongodb.net:27017,cluster0-shard-00-01-ryrmi.mongodb.net:27017,cluster0-shard-00-02-ryrmi.mongodb.net:27017/flowace?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority';
const opts = { useNewUrlParser: true};

createConnection();

async function createConnection() {
    await mongoose.connect(mongoUrl, opts)
        .then(res => console.log("Connected to Database"))
        .catch(function (reason) {
        console.log('Unable to connect to the mongodb instance. Error: ', reason);
    });
}

const conn = mongoose.connection;
const Schema = mongoose.Schema;

const schema = new Schema({
    id: Number,
    name: String,
    email: String,
    departmentId: Number,
    departmentName: String,
    password: String
});

const deptschema = new Schema({
    id: Number,
    name: String
});

const productschema = new Schema({
    id: Number,
    name: String,
    description: String,
    count: Number,
    price: Number
});

const countschema = new Schema({
    name: String,
    counter: Number
});

const requestschema = new Schema({
    id: Number,
    status: Number,             //  -1: rejected, 0: accepted, 1: pending, 2: In Cart
    productId: Number,
    productName: String,
    productPrice: String,
    uid: Number,
    uname: String
});

const userModel = mongoose.model('users', schema);
const deptModel = mongoose.model('departments', deptschema);
const productModel = mongoose.model('products', productschema);
const counterModel = mongoose.model('counters', countschema);
const requestModel = mongoose.model('requests', requestschema);

var urlencodedParser = parser.urlencoded({extended: false});

module.exports = function(app){

    app.get('/', isLoggedIn, function (request, response){
        response.render('home', {userData: request.session});
    });

    app.get('/login', isLoggedIn, function (request, response){
        response.render('home', {userData: request.session});
    });

    app.post('/login', urlencodedParser, function (request, response){

        userModel.find({email: request.body.email}, function (err, docs) {
            //if (err) throw err;
            if(docs.length == 0){
                response.render('login', {message: 'User is not Registered'});   //user does not exist
            }
            else{
                for(var i = 0 ; i < docs.length ; i++){
                    if(hash.verify(request.body.password, docs[i].password)){
                        //password matches
                        request.session._flowace_id = docs[i].id;
                        request.session._flowace_email = docs[i].email;
                        request.session._flowace_name = docs[i].name;
                        request.session._flowace_departmentId = docs[i].departmentId;
                        request.session._flowace_departmentName = docs[i].departmentName;

                        request.session.save(function (err) {
                            response.redirect('/');
                        });
                        break;
                    }
                    if(i == docs.length - 1){
                        response.render('login', {message: 'Incorrect Password'});   //incorrect password
                    }
                }
            }
        });
    });

    app.get('/signup', function (request, response){
        deptModel.find({}, function (err, docs) {
            if(request.session){
                request.session.destroy();
            }
            response.render('signup', {departments: docs});
        });
    });

    app.post('/signup', urlencodedParser, function (request, response){
        
        var instance = new userModel();
        instance.name = request.body.name;
        instance.email = request.body.email;
        instance.departmentId = request.body.department;
        instance.password = hash.generate(request.body.password);

        deptModel.find({id: instance.departmentId}, function (err, docs) {
            
            instance.departmentName = docs[0].name;
            counterModel.findOneAndUpdate({name: 'users'}, {$inc:{counter:1}}, function (err, docscount) {
                
                instance.id = docscount.counter;
                instance.save(function (err) {
                    //if (err) throw err;
                    if (err) response.redirect('/signup');
                    request.session._flowace_id = instance.id;
                    request.session._flowace_email = instance.email;
                    request.session._flowace_name = instance.name;
                    request.session._flowace_departmentId = instance.departmentId;
                    request.session._flowace_departmentName = instance.departmentName;

                    request.session.save(function (err) {
                        response.redirect('/');
                    });
                    
                });
            });

        });
        
    });

    app.get('/logout', function (request, response) {
        if(request.session){
            request.session.destroy(function(err) {
                if(err) {
                    return next(err);
                } else {
                    response.redirect('/login');
                }
            });
        }
    });

    function isLoggedIn (request, response, next) {
        if (!(request.session && request.session._flowace_id && request.session._flowace_email && request.session._flowace_name)) {
            response.render('login');
        }
        else{
            next();
        }
    }

    app.get('/dept', function (request, response){
        var data = {code: -111};
        deptModel.find({}, function (err, docs) {
            if(!err){
                data.code = 555;
                data.data = docs;
            }
            response.end(JSON.stringify(data));
        });
    });

    app.get('/product', function (request, response){
        var data = {code: -111};
        productModel.find({}, function (err, docs) {
            if(!err){
                data.code = 555;
                data.data = docs;
            }
            response.end(JSON.stringify(data));
        });
    });

    app.post('/request', urlencodedParser, function (request, response){
        var data = {code: -111};
        counterModel.findOneAndUpdate({name: 'requests'}, {$inc:{counter:1}}, function (err, docscount) {

            var req_instance = new requestModel();
            req_instance.id = docscount.counter;
            req_instance.productId = request.body.pid;
            req_instance.productName = request.body.pname;
            req_instance.productPrice = request.body.pprice;
            req_instance.uid = request.session._flowace_id;
            req_instance.uname = request.session._flowace_name;
            req_instance.status = 2;

            req_instance.save(function (err) {
                if(!err){
                    data.code = 555;
                }
                response.end(JSON.stringify(data));
                io.emit('new request', req_instance);
            });
        });
    });

    app.get('/service/:type', isLoggedIn, function (request, response){
        
        var data = [];
        var opts = { uid: request.session._flowace_id };
        switch(request.params.type){
            case 'cart':
                opts.status = 2;
            break;
            case 'orders':
                if(request.session._flowace_departmentId == 2){     //admin
                    opts = {};
                }
                //opts.status = 1;
            break;
        }
        requestModel.find(opts).sort({id: -1}).exec(function (err, docs) {
            if(!err){
                data = docs;
            }
            data.pageUri = request.params.type;
            data.userData = request.session;
            response.render('service', {requestData: data});
            
        });
        
    });

    app.get('/accept', isLoggedIn, function (request, response){

        var resdata = {code: -111};
        requestModel.findOneAndUpdate({id: request.query.id}, {$set:{status: 0 }} , function (err, docs) {
                if(!err){
                    resdata.code = 555;
                    resdata.id = request.query.id;
                }
                response.end(JSON.stringify(resdata));
                io.emit('approved request', docs);
        });

    });

    app.get('/reject', isLoggedIn, function (request, response){

        var resdata = {code: -111};
        requestModel.findOneAndUpdate({id: request.query.id}, {$set:{status: -1 }} , function (err, docs) {
                if(!err){
                    resdata.code = 555;
                    resdata.id = request.query.id;
                }
                response.end(JSON.stringify(resdata));
                io.emit('rejected request', docs);
        });

    });

    app.get('/place', isLoggedIn, function (request, response){

        var resdata = {code: -111};
        requestModel.updateMany({uid: request.session._flowace_id, status: 2}, {$set:{status: 1 }} , function (err, docs) {
            if(!err){
                resdata.code = 555;
                resdata.uid = request.session._flowace_id;
            }

            var opts = { uid: request.session._flowace_id, status: 1 };
            requestModel.find(opts).sort({id: -1}).limit(docs.nModified).exec(function (err, docs) {
                if(!err){
                    resdata.aData = docs;
                }
                response.end(JSON.stringify(resdata));
                io.emit('placed request', resdata);
            });
        });

    });

};

