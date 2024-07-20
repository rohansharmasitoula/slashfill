# Coming Soon to the Web Store!
<p>
  <img src="public/logo.png" alt="Logo" width="80" height="80" style="vertical-align: middle;">
</p>

**SlashFill** is a Chrome extension designed to streamline data entry on web pages by using environment-based tags and slash commands for quick population. Ideal for developers and QA professionals, this extension helps you manage and populate data efficiently with slash (`/`) command.

<video width="600" controls>
  <source src="https://github.com/user-attachments/assets/feec5780-fb37-4235-bcd0-2d506e11d24b" type="video/mp4">
  Your browser does not support the video tag.
</video>
<br>
<video width="600" controls>
  <source src="https://github.com/user-attachments/assets/09d94ca0-545d-4916-9e0f-e3fede4256fc" type="video/mp4">
  Your browser does not support the video tag.
</video>

## Features

- **Quick Data Entry**: Save and auto-fill data using environment-based tags and slash commands.
- **Import/Export Data**: Import and export your data as JSON files.
- **Search Functionality**: Quickly find and manage your saved data.
- **Edit and Delete**: Update or remove individual entries or delete selected items.
- **Dropdown Suggestions**: Receive real-time suggestions based on your input.

## Installation
- Download the Zip file from [SlashFill.zip](https://github.com/rohansharmasitoula/slashfill/raw/master/slashfill.zip)
- Unzip the file
- Open Chrome and go to `chrome://extensions/`.
- Enable "Developer mode" (toggle switch in the top-right corner).
- Click "Load unpacked" and select the `slashfill` directory that you unzipped

## Usage

1. **Open the Extension:**

   Click on the SlashFill icon in your Chrome toolbar to open the popup.

2. **Configure Data:**

   - Enter your data (key, value, and environment tag) in the configuration section.
   - Click "Save" to store the data.

3. **Import/Export Data:**

   - Use the "Import" button to upload a JSON file with your data.
   - Use the "Export" button to download your data as a JSON file.

4. **View and Manage Data:**

   - Use the search bar to filter your saved data.
   - Select items using checkboxes to delete multiple entries at once.
   - Click on "Delete" or "Update" buttons to manage individual entries.

5. **Use Slash Commands:**

   Type a slash (`/`) followed by the key to get suggestions based on your stored data. Select a suggestion to auto-fill the input field.

## Development

1. **Clone the Repository:**

   ```bash
   git clone git@github.com:rohansharmasitoula/slashfill.git
   cd slashfill
   ```

2. **Install Dependencies:**

   Ensure you have [Node.js](https://nodejs.org/) installed, then run:

   ```bash
   yarn install
   ```

3. **Build the Extension:**

   Compile the extension with:

   ```bash
   yarn build:dev
   ```
4. **Load the Extension in Chrome:**

   - Open Chrome and go to `chrome://extensions/`.
   - Enable "Developer mode" (toggle switch in the top-right corner).
   - Click "Load unpacked" and select the `dist` directory from the project.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request to contribute to the project.

