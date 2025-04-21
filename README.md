# Import Export Website

A modern, responsive website for an import-export business built with HTML, CSS, and JavaScript.

## Features

- Responsive design that works on all devices
- Modern and clean user interface
- Smooth scrolling navigation
- Interactive service cards
- Animated statistics
- Contact form with local storage
- Mobile-friendly navigation
- Social media integration

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6+)
- Node.js
- Express
- Font Awesome Icons
- Google Fonts

## Project Structure

```
├── index.html          # Main HTML file
├── styles.css          # CSS styles
├── script.js           # JavaScript functionality
├── server.js           # Node.js server
├── public/             # Static files
├── index.html      # Test form page
├── admin.html      # Admin page to view submissions
├── submissions/        # Directory for storing form submissions
├── .env                # Environment variables
├── package.json        # Project dependencies
└── README.md           # Project documentation
```

## Setup and Installation

1. Clone the repository:
```bash
git clone [repository-url]
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

4. Open the website in your browser:
   - Main website: Open `index.html` directly
   - Test form: Visit `http://localhost:3000`
   - Admin page: Visit `http://localhost:3000/admin.html`

## Form Submission Functionality

The contact form stores submissions locally:
1. When a user submits the form, the data is sent to the server
2. The server saves the submission as a JSON file in the `submissions` directory
3. You can view all submissions by visiting the admin page at `http://localhost:3000/admin.html`

## Customization

### Colors
The main colors used in the website can be modified in the `styles.css` file:
- Primary Color: `#3498db`
- Secondary Color: `#2c3e50`
- Background Colors: `#f9f9f9`, `#fff`

### Content
- Update the content in `index.html` to match your business information
- Modify the services section to reflect your actual services
- Update contact information and social media links

### Images
- Replace the hero background image URL in `styles.css`
- Add your company logo
- Update any other images as needed

## Browser Support

The website is compatible with:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Opera (latest)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

Your Name - your.email@example.com
Project Link: [https://github.com/yourusername/project-name](https://github.com/yourusername/project-name) 
