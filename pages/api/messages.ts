const messagesdata = [
  { sender: "AI", text: "Hello Harry, how are you?" },
  { sender: "Harry", text: "Hey, I'm doing well. How about you?" },
  // Add more message objects here as needed
];

export default function messages(req, res) {
  // Set the Content-Type header
  res.setHeader("Content-Type", "application/json");

  // Send the messages data as a JSON response
  res.json(messagesdata);
}
