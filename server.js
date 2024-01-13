// Import required modules
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const crypto = require("crypto"); // For unsubscribe functionality
const emailObjects = require("./emailObjects");

// Create an Express app
const app = express();
app.use(express.json());

// Serving static files from the assets directory i.e. images or css files
app.use("/assets", express.static(path.join(__dirname, "assets")));

// Connect to MongoDB
// mongoose.connect(process.env.DATABASE_URL, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

// Create a Mongoose schema for email data
const emailSchema = new mongoose.Schema({
  email: { type: String, required: true },
  subscribed: { type: Boolean, default: true },
  unsubscribeToken: { type: String },
  lastEmailIndex: { type: Number, default: -1 }, //field to track the last email sent index
});

// Create a Mongoose model for emails
const Email = mongoose.model("Email", emailSchema);

// Sending Welcome Email
const welcomeEmailData = emailObjects.welcomeEmail;
const sendEmail = async (recipient, welcomeEmail) => {
  const mailOptions = {
    from: process.env.USER_EMAIL,
    to: recipient,
    subject: welcomeEmailData.subject,
    html: welcomeEmailData.html,
  };
};

const sendNextEmail = async (user) => {};

// Define the route to handle form submissions
app.post("/subscribe", async (req, res) => {
  const { email } = req.body;

  try {
    // Check if the email is already subscribed
    const existingEmail = await Email.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: "Email already subscribed" });
    }

    // Create a new email object
    const newEmail = new Email({ email });

    // Generate a unique unsubscribe token
    const unsubscribeToken = crypto.randomBytes(20).toString("hex");
    newEmail.unsubscribeToken = unsubscribeToken;

    // Save the email to the database
    await newEmail.save();

    // Send Welcome email
    sendEmail(email, welcomeEmailData);
    // Sending the first email Tip after a user subscribes
    // if (newEmail.subscribed) {
    //   await sendNextEmail(newEmail);
    // }
    res.json({ message: "Subscription successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Unsubscribe functionality
// Update to remove a subscribed user from the DB
app.post("/unsubscribe", async (req, res) => {
  const { email, unsubscribeToken } = req.body;

  try {
    // Find the email in the database
    const existingEmail = await Email.findOne({ email });

    if (!existingEmail) {
      return res.status(404).json({ error: "Email not found" });
    }

    if (existingEmail.unsubscribeToken !== unsubscribeToken) {
      return res.status(401).json({ error: "Invalid unsubscribe token" });
    }

    // Update the subscribed field to false
    existingEmail.subscribed = false;
    await existingEmail.save();

    res.json({ message: "Unsubscribed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Configure Nodemailer for sending emails
const transporter = nodemailer.createTransport({
  // Set up your email provider's SMTP settings
  service: "Gmail",
  auth: {
    user: process.env.USER_EMAIL,
    pass: process.env.USER_PASSWORD,
  },
});

// This where we define the content of the emils we sending, as an array of json objects
const emailData = [
  // First email will be welcome email.
  {
    subject:
      "I'm writing the IELTS exam, in a month, and I feel like I'm nowhere ...",
    heading: "becausewrite, we got You!",
    intro: "Hey there, you're preparing for the IELTS exam? ...",
    tip: "Tip of the Day: Read and Understand the Task!",
    tipText: "Take a deep breath and read the task carefully. ...",
    example: {
      Task: "path/to/example/task.png",
      TipAnswer: "path/to/example/tip-answer.png",
    },
    outro: "Convinced to improve your IELTS writing skills? ...",
    quote: "Don't watch the clock; do what it does. Keep going. - Sam Levenson",
  },
  {
    subject: "Master the Art of IELTS Speaking",
    heading: "Speak Like a Pro!",
    intro: "Hello IELTS achiever! Ready to take your speaking skills ...",
    tip: "Tip of the Day: Practice with Native Speakers",
    tipText:
      "To improve your speaking, practice with native English speakers ...",
    example: {
      Task: "path/to/speaking/example.png",
      TipAnswer: "path/to/speaking/tip-answer.png",
    },
    outro: "Ready to shine in your IELTS speaking test? ...",
    quote: "The expert in anything was once a beginner. - Helen Hayes",
  },
  // ... (add more email objects)
];

// Define a function to send emails to subscribed users
// Define a variable to keep track of the next email index
let nextEmailIndex = 0;
const sendEmails = async () => {
  try {
    // Retrieve all subscribed emails from the database
    const emails = await Email.find({ subscribed: true });

    // Iterate over each email and send the content
    for (const email of emails) {
      const { email: recipient } = email;

      // Get a random email data object
      // Get the current email data object based on the nextEmailIndex
      const currentEmailData = emailData[nextEmailIndex];
      // const currentEmailData =
      //   emailData[Math.floor(Math.random() * emailData.length)];

      // Increment the nextEmailIndex and reset it if it exceeds the array length
      nextEmailIndex++;
      if (nextEmailIndex >= emailData.length) {
        nextEmailIndex = 0;
      }

      // Compose the email content
      const mailOptions = {
        from: "your-email@gmail.com",
        to: recipient,
        subject: currentEmailData.subject,
        html: `
          <h1>${currentEmailData.heading}</h1>
          <p>${currentEmailData.intro}</p>
          <h2>${currentEmailData.tip}</h2>
          <p>${currentEmailData.tipText}</p>
          <h2>Example:</h2>
          <img src="${currentEmailData.example.Task}" alt="Example Task" />
          <img src="${currentEmailData.example.TipAnswer}" alt="Tip Answer" />
          <p>${currentEmailData.outro}</p>
          <blockquote>${currentEmailData.quote}</blockquote>
          <p>... include footer with unsubscribe directory ...</p>
        `,
      };

      // Send the email
      await transporter.sendMail(mailOptions);
    }
  } catch (error) {
    console.error(error);
  }
};

// Schedule the email sending function to run once a week (adjust the timing as needed)
const intervalInMilliseconds = (7 * 24 * 60 * 60 * 1000) / 3; // Sends 3 emails a week
setInterval(sendEmail, intervalInMilliseconds);

// ------------------------------- Start the server when we connect to the database -------------------------//

const port = 3001;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

// ---------------------------- Front-end Code to adjust -------------------------------- //
// import React, { useState } from 'react';
// import axios from 'axios';
// import { Input, Button } from 'your-ui-library'; // Replace 'your-ui-library' with the actual library you are using

// const YourComponent = () => {
//   const [email, setEmail] = useState('');

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       // Send a POST request to the backend to subscribe the email
//       await axios.post('/subscribe', { email });

//       // Reset the email input
//       setEmail('');
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit}>
//       <Input
//         variant="outlined"
//         color="warning"
//         size="md"
//         placeholder="Email Address"
//         required
//         value={email}
//         onChange={(e) => setEmail(e.target.value)}
//         sx={{ marginBottom: '0.6rem' }}
//       />
//       <Button
//         variant="contained"
//         sx={{
//           ':hover': { backgroundColor: '#9d7f5a' },
//           backgroundColor: '#222',
//         }}
//         size="meduim"
//         type="submit"
//         fullWidth
//       >
//         Let's Do This!
//       </Button>
//     </form>
//   );
// };

// export default YourComponent;
