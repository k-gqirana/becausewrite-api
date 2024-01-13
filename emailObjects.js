// Add URL to resource page at the bottom
const welcomeEmail = {
  subject: "Well, that's a step in the right direction.",
  html: `<!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {
                font-family: 'Arial', sans-serif;
                line-height: 1.6;
                margin: 0;
                padding: 0;
                background-color: rgb(255, 225, 188);
                color: rgb(221, 114, 5);
            }
    
            .container {
                max-width: 600px;
                margin: 20px auto;
                padding: 20px;
                background-color: white;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
    
            h1 {
                color: rgb(221, 114, 5);
            }
    
            p {
                margin-bottom: 15px;
            }
    
            a {
                color: rgb(221, 114, 5);
                text-decoration: none;
                font-weight: bold;
            }
    
            .button {
                display: inline-block;
                padding: 10px 20px;
                background-color: rgb(221, 114, 5);
                color: white;
                border-radius: 5px;
                text-decoration: none;
            }
        </style>
    </head>
    
    <body>
        <div class="container">
            <h1>Welcome to Because Write!</h1>
            <p>Thank you for subscribing to our IELTS exam tips service. We are thrilled to have you on board as we help you prepare and succeed in your IELTS journey.</p>
            <p>At Because Write, we understand the importance of achieving your best score, and we're here to support you every step of the way. Our expert tips and resources will empower you to excel in your IELTS exam.</p>
            <p>To get started, explore our latest tips and insights on our <a href="[Your Landing Page URL]" target="_blank">landing page</a>. Feel free to reach out if you have any questions or need assistance.</p>
            <p>Best of luck with your IELTS preparation!</p>
            <p>Warm regards,</p>
            <p>The Because Write Team</p>
            <p><a href="[Your Contact Page URL]" class="button">Get More Tips here</a></p>
        </div>
    </body>
    
    </html>
    `,
};

const emailTips = [
  {
    subject:
      "I'm writing the IELTS exam, in a month, and I feel like I'm nowhere ... ",
    html: "",
  },
];

module.exports = {
  welcomeEmail,
};
