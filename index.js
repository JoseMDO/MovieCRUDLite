const express = require("express");
const cors = require('cors');

const app = express();

app.use(express.static(__dirname + '/client'))
app.use(cors());

const bodyParser = require("body-parser")
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json());

const mongoose = require("mongoose")

const mongooseUri = "mongodb+srv://JoseMDO:mongodbpassword123@cluster0.wupcpm1.mongodb.net/movie_database"
mongoose.connect(mongooseUri, { useNewUrlParser: true, useUnifiedTopology: true })
const movieSchema = {
	title: String,
	comments: String
}

const Movie = mongoose.model("movie", movieSchema)

app.post("/create", function (req, res) {
	let newNote = new Movie({
		title: req.body.title,
		comments: req.body.comments
	})
	newNote.save();
	res.redirect("/")
})

const renderNotes = (notesArray) => {
	let text = "Movies Collection:\n\n"
	notesArray.forEach((note) => {
		text += "Title: " + note.title + "\n"
		text += "Comments: " + note.comments + "\n"
		text += "ID: " + note._id + "\n\n"
	});
	text += "Total Count: " + notesArray.length 
	return text
}

app.get("/readjson", function(req, res){
	Movie.find({}).then(notes => {
		res.type("application/json")
		res.send(notes)
	})
})

app.get("/read", function(req, res){
	Movie.find({}).then(notes => {
		res.type("text/plain")
		res.send(renderNotes(notes))
	})
})



app.put('/update/:id', async (req, res) => {
	const { id } = req.params;
	const { title, comments } = req.body

	try {
		const movie = await Movie.findByIdAndUpdate(id, { title, comments }, { new:true });
		res.send(movie);
	} catch (error) {
		console.error(error);
		res.status(500).send(error);
	}
})

app.delete('/delete/:id', async (req, res) => {
	const { id } = req.params;
	try {
	  const user = await Movie.findByIdAndDelete(id);
	  res.send(user);
	} catch (error) {
	  console.error(error);
	  res.status(500).send(error);
	}
  });



const port = process.env.PORT || 3000
app.get('/test', function(request, response) {
	response.type('text/plain')
	response.send('Node.js and Express running on port='+port)
})

app.listen(port, function() {
	console.log("Server is running at " + port)
})
