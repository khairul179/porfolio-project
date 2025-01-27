const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const nodemailer = require("nodemailer");

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public")); // Serve static files

// Connect to SQLite database
const db = new sqlite3.Database("./portfolio.db", (err) => {
    if (err) console.error("Error connecting to database:", err.message);
    else console.log("Connected to SQLite database.");
});

// Create tables
db.serialize(() => {
    db.run(
        "CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY, name TEXT, email TEXT, message TEXT, date TIMESTAMP DEFAULT CURRENT_TIMESTAMP)"
    );
    db.run(
        "CREATE TABLE IF NOT EXISTS testimonials (id INTEGER PRIMARY KEY, name TEXT, testimonial TEXT, date TIMESTAMP DEFAULT CURRENT_TIMESTAMP)"
    );
    db.run(
        "CREATE TABLE IF NOT EXISTS projects (id INTEGER PRIMARY KEY, title TEXT, description TEXT, tools TEXT)"
    );
});

// Endpoint to handle contact form submissions
app.post("/api/contact", (req, res) => {
    const { name, email, message } = req.body;

    // Store message in the database
    db.run(
        "INSERT INTO messages (name, email, message) VALUES (?, ?, ?)",
        [name, email, message],
        (err) => {
            if (err) {
                console.error("Error saving message:", err.message);
                res.status(500).json({ success: false, message: "Error saving your message. Please try again." });
            } else {
                // Send acknowledgment email
                const transporter = nodemailer.createTransport({
                    service: "Gmail",
                    auth: { user: "your-email@gmail.com", pass: "your-password" },
                });

                const mailOptions = {
                    from: "your-email@gmail.com",
                    to: email,
                    subject: "Message Received!",
                    text: `Hi ${name},\n\nThank you for reaching out! I'll get back to you soon.\n\nBest regards,\nKhairul`,
                };

                transporter.sendMail(mailOptions, (error) => {
                    if (error) console.error("Error sending email:", error.message);
                });

                res.status(200).json({ success: true, message: "Message received! I'll get back to you soon." });
            }
        }
    );
});

// Endpoint to fetch testimonials
app.get("/api/testimonials", (req, res) => {
    db.all("SELECT * FROM testimonials ORDER BY date DESC", [], (err, rows) => {
        if (err) {
            console.error("Error fetching testimonials:", err.message);
            res.status(500).json({ success: false, message: "Error fetching testimonials." });
        } else {
            res.json(rows);
        }
    });
});

// Serve the portfolio
app.get("/", (req, res) => res.sendFile(__dirname + "/index.html"));

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
