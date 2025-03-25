export type Preference = {
	music: string[];
	movie: string[];
	hobby: string[];
};


/*

curl -X POST http://localhost:3001/api/preferences \
-d '{
  "userId": "user_2udhMJbOA4zqkztKzYXxlULWo42",
  "preference": {
    "music": ["rock", "jazz", "classical"],
    "movie": ["sci-fi", "drama", "comedy"],
    "hobby": ["woodworking", "coding", "gaming"]
  }
}'


*/