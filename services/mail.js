import sgMail from '@sendgrid/mail';
sgMail.setApiKey('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');
const msg = {
  to: 'perezcato2000@gmail.com',
  from: 'perezcatoc@gmail.com',
  subject: 'Sending with Twilio SendGrid is Fun',
  text: 'and easy to do anywhere, even with Node.js',
  html: '<strong>and easy to do anywhere, even with Node.js</strong>',
}
sgMail.send(msg).then(err => { console.log(err)}).catch(err => console.log(err.response.body));
