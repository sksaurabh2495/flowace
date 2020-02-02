$(function(){

  $('.ui.form.signup')
  .form({
    fields: {
      name: {
        identifier: 'name',
        rules: [
        {
          type   : 'empty',
          prompt : 'Please enter your name'
        }
        ]
      },
      department: {
        identifier: 'department',
        rules: [
        {
          type   : 'empty',
          prompt : 'Please select a department'
        }
        ]
      },
      email: {
        identifier: 'email',
        rules: [
        {
          type   : 'empty',
          prompt : 'Please enter you email'
        }
        ]
      },
      password: {
        identifier: 'password',
        rules: [
        {
          type   : 'empty',
          prompt : 'Please enter a password'
        }
        ]
      },
      terms: {
        identifier: 'terms',
        rules: [
        {
          type   : 'checked',
          prompt : 'You must agree to the terms and conditions'
        }
        ]
      }
    }
  })
;

  $('.ui.form.login')
  .form({
    fields: {
      email: {
        identifier: 'email',
        rules: [
        {
          type   : 'empty',
          prompt : 'Please enter you email'
        }
        ]
      },
      password: {
        identifier: 'password',
        rules: [
        {
          type   : 'empty',
          prompt : 'Please enter a password'
        }
        ]
      }
    }
  })
;

});
