# Google Maps Setup

This application uses Google Maps to display facility and corporation locations.

## Setup Instructions

1. **Get a Google Maps API Key**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the "Maps JavaScript API"
   - Create credentials (API Key)
   - Restrict the API key to your domain for security

2. **Configure the API Key**
   - Create a `.env` file in the `frontend` directory (if it doesn't exist)
   - Add the following line:
     ```
     VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
     ```
   - Replace `your_api_key_here` with your actual Google Maps API key

3. **Restart the Development Server**
   - Stop the current dev server (Ctrl+C)
   - Run `npm run dev` again to load the new environment variable

## Notes

- The API key is loaded from the environment variable `VITE_GOOGLE_MAPS_API_KEY`
- If the API key is not configured, the map will display a placeholder with the coordinates
- Make sure to restrict your API key in Google Cloud Console to prevent unauthorized use

