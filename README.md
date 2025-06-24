# Phone Recommender Chatbot

This is a web-based chatbot designed to help users find the perfect mobile phone based on their needs. Users can describe what they are looking for, and the chatbot will provide recommendations from its database. It can also provide summarized reviews for specific phone models.

## Features

* **Conversational Recommendations**: Simply tell the chatbot what you're looking for in a phone (e.g., "a phone with a great camera and long battery life") and it will provide you with a list of suitable options.
* **Phone Reviews**: Ask for reviews of a specific phone model, and the chatbot will give you a summary of what other users think.
* **Multi-language Support**: The interface and the chatbot's responses can be switched between English and Arabic.
* **Chat History**: Your conversations are saved locally, so you can review them at any time.
* **Responsive Design**: The user interface is designed to work well on both desktop and mobile devices.

## Technologies Used

* **Frontend**: HTML, CSS, JavaScript
* **UI Framework**: Bootstrap
* **Icons**: Font Awesome
* **CSV Parsing**: PapaParse
* **Markdown Rendering**: Marked.js

## Project Structure

The project is structured into several files, each with a specific purpose:

| File                | Description                                                                                               |
| ------------------- | --------------------------------------------------------------------------------------------------------- |
| `index.html`        | The main HTML file that defines the structure of the chatbot's user interface.                            |
| `style.css`         | Contains all the CSS rules for styling the application.                                                   |
| `main.js`           | The core JavaScript file that handles user input and communication with the AI model.                     |
| `chat.js`           | Manages the chat functionality, including saving and loading conversations.                               |
| `recommendation.js` | Contains the logic for generating phone recommendations based on user queries.                            |
| `review.js`         | Handles the logic for fetching and displaying phone reviews.                                              |
| `language.js`       | Manages the multi-language support for the application.                                                   |
| `ui.js`             | Includes JavaScript for enhancing the user interface with animations and other dynamic effects.           |
| `mobiles.csv`       | A CSV file containing the database of mobile phones and their specifications.                             |
| `reviews.csv`       | A CSV file with user reviews for different phone models.                                                  |

## How to Use

1.  **Clone the repository**:
    ```bash
    git clone [https://github.com/your-username/phone-recommender-chatbot.git](https://github.com/your-username/phone-recommender-chatbot.git)
    ```
2.  **Add your API Key**:
    * Open the `main.js` file.
    * Find the line with `const apiKey = '...';`.
    * Replace the placeholder key with your own API key from your chosen AI provider.
3.  **Run the application**:
    * Open the `index.html` file in your web browser.

## Future Improvements

Here are some ideas for future enhancements to this project:

* **Add more languages**: Extend the multi-language support to include more languages.
* **Expand the database**: Add more phone models to the `mobiles.csv` file.
* **Live Review API**: Integrate with a live reviews API to provide more up-to-date feedback.
* **User Accounts**: Implement user accounts to allow users to save their chat history across different devices.
* **More sophisticated recommendations**: Improve the recommendation algorithm to consider more factors and provide more personalized suggestions.

## Contributors

We welcome contributions from the community! If you'd like to contribute to this project, please follow these steps:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Make your changes and commit them with clear, descriptive messages.
4.  Push your changes to your fork.
5.  Create a pull request to the main repository's `main` branch.

We appreciate your help in making this project even better!
