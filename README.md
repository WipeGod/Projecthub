# BetterSoftware Internship Project

This project is a simple React (Next.js) frontend integrated with a Flask backend API. It is designed as an assessment project for an internship at BetterSoftware company.

## Project Structure

- `backend/`: Flask backend application
- `src/app/`: Next.js React frontend application

## Backend Setup (Flask)

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create a virtual environment (optional but recommended):
   ```
   python3 -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Run the Flask backend server:
   ```
   python app.py
   ```

   The backend server will run on `http://localhost:5000`.

## Frontend Setup (Next.js)

1. Navigate to the project root (if not already there):
   ```
   cd ..
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Run the Next.js development server:
   ```
   npm run dev
   ```

   The frontend will run on `http://localhost:3000`.

## Usage

- The frontend fetches a welcome message from the Flask backend API and displays it.
- Ensure both backend and frontend servers are running concurrently.

## Notes

- The frontend uses Tailwind CSS for styling and Google Fonts for typography.
- CORS is enabled in the Flask backend to allow cross-origin requests from the frontend.

## Contact

For any questions, please contact the project author.
