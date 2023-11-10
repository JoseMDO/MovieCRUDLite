require('dotenv').config()
const express = require("express");
const cors = require('cors');
const passport = require('passport')
const app = express();
const session = require('express-session')
app.use(cors());

app.use(express.static(__dirname + '/client'))


const bodyParser = require("body-parser")
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json());









// Authentication  

app.use(passport.initialize())
const GitHubStrategy = require('passport-github2').Strategy


app.use(session({
	secret: 'my-secret-key',
	resave: false,
	saveUninitialized: false,
	cookie: { 
		httpOnly: true,
		secure : false,
		maxAge: 24 * 60 * 60 * 1000,
	 }

}))


passport.use(new GitHubStrategy({
    clientID: "7072f7f40549cf49c75f",
    clientSecret: "098b3ab18cd86b0e1d2fbcf5446e69ae4a2046c9",
    callbackURL: "https://moviecrudlitejose.azurewebsites.net/auth/github/callback"
  },
  function(accessToken, refreshToken, profile, done) {
	console.log("logged in as:" + profile.id)
    return done(null, profile)
  }
));


app.use(passport.session())

passport.serializeUser(function (user, cb) {
	cb(null, user.id)
})
passport.deserializeUser(function (id, cb) {
	cb(null, id)
})

const isAuth = (req, res, next) => {
	if (req.user) {
		console.log("logged in 1" + req.user)
	  	next();
	} else {
		console.log("not logged in")
	  	res.redirect('/login');
	}
  };

app.get("/", isAuth,  (req, res) => {
	console.log("logged in 2" + req.user)
	res.sendFile(__dirname + "/client/index.html")
})



app.get("/login", (req, res) => {
	if (req.user) {
		res.redirect("/")
		console.log(req.user)
	}
	res.sendFile(__dirname + "/client/login.html")
	console.log(req.user);
})

app.get("/logout", (req, res) => {
	req.logOut((err) => {
		if (err) {
			console.log(error)
			return next(err);
		}
	});
	console.log("logged out")
	res.redirect('/login')
})






app.get('/auth/github', passport.authenticate('github', { scope: [ 'user:email' ] }));

app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });

























const mongoose = require("mongoose")

const mongooseUri = "mongodb+srv://JoseMDO:mongodbpassword123@cluster0.olmshbe.mongodb.net/test"

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
	}).catch(error => {
		console.error("Error fetching data: ", error);
		res.status(500).json({ error: "Internal Server Error" });
	  });
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




