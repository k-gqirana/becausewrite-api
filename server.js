// Import required modules
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const crypto = require("crypto"); // For unsubscribe functionality

// Create an Express app
const app = express();
app.use(express.json());

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
});

// Create a Mongoose model for emails
const Email = mongoose.model("Email", emailSchema);

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

    res.json({ message: "Subscription successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Unsubscribe functionality
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

// Define a function to send emails to subscribed users
const sendEmails = async () => {
  try {
    // Retrieve all subscribed emails from the database
    const emails = await Email.find({ subscribed: true });

    // Iterate over each email and send the content
    for (const email of emails) {
      const { email: recipient } = email;

      // Compose the email content
      const mailOptions = {
        from: "your-email@gmail.com",
        to: recipient,
        subject: "Weekly Email",
        html: `<h1>IELTS Task:</h1>
        <p>...</p>
        <h1>Tip of the Day:</h1>
        <p>...</p>
        <h1>Example:</h1>
        <p>...</p>
        <h1>Motivational Quote:</h1>
        <p>...</p>`,
      };

      // Send the email
      await transporter.sendMail(mailOptions);
    }
  } catch (error) {
    console.error(error);
  }
};

// Schedule the email sending function to run once a week (adjust the timing as needed)
setInterval(sendEmails, 7 * 24 * 60 * 60 * 1000);

// ------------------------------- Start the server when we connect to the database -------------------------//

const port = 3001; // You can change the port number if needed
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
