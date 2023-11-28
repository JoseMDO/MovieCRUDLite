require('dotenv').config()
const express = require("express");
const cors = require('cors');
const passport = require('passport')
const app = express();
const session = require('express-session')
const GitHubStrategy = require('passport-github2').Strategy

app.use(express.static(__dirname + '/client'))
app.set("trust proxy", 2);

const bodyParser = require("body-parser")
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json());


// Authentication  



app.use(session({
	secret: 'my-secret-key',
	resave: false,
	saveUninitialized: false,
	cookie: { 
		// httpOnly: true,
		secure : true,
		maxAge: 24 * 60 * 60 * 1000,
	 }
}))


app.use(passport.initialize())
app.use(passport.session())

app.use(cors({
	origin:"https://moviecrudlitejose.azurewebsites.net",
	methods: "GET, POST, PUT, DELETE",
	credentials: true,
})
)


passport.use(new GitHubStrategy({
    clientID: "7072f7f40549cf49c75f",
    clientSecret: "098b3ab18cd86b0e1d2fbcf5446e69ae4a2046c9",
    callbackURL: "https://moviecrudlitejose.azurewebsites.net/auth/github/callback"
  },
  function(accessToken, refreshToken, profile, done) {
	console.log("GitHub authentication callback");
    console.log("Profile:", profile.id);
    return done(null, profile)
  }
));

passport.serializeUser(function (user, cb) {
	console.log('Serializing user:', user);
	cb(null, user.id)
})
passport.deserializeUser(function (id, cb) {
	console.log('Deserializing user ID:', id);
	cb(null, id)
})

  
  app.get('/get-session', (req, res) => {
	const username = req.session.username;
	res.send('Session username: ' + username);
  });


const isAuth = (req, res, next) => {
	console.log("isAuth middleware for: ", req.url);
	console.log("req.user:", req.user);
	if (req.user) {
	  console.log("User is authenticated:", req.user);
	  next();
	} else {
	  console.log("User is not authenticated. Redirecting to /login");
	  res.redirect('/login');
	}
  };

app.get("/", isAuth, (req, res) => {
	console.log("logged in 2: ", req.user)
	res.sendFile(__dirname + "/client/main.html")
})
const protectedRoutes = ["/create.html", "/dashboard.html", "/delete.html", "/main.html", "/update.html"];

protectedRoutes.forEach(route => {
  app.get(route, isAuth, (req, res) => {
    console.log(`logged in 2: ${req.user} accessing ${route}`);
    res.sendFile(__dirname + `/client${route}`);
  });
});



app.get("/login", (req, res) => {
	if (req.user) {
		console.log("logged in: ", req.user)
		res.redirect("/main.html")
		return
	}
	console.log("not logged in")
	res.sendFile(__dirname + "/client/login.html")
})

app.get("/logout", (req, res) => {
	req.logOut((err) => {
		if (err) {
			console.log('log out error: ' + error)
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












// DATABASE






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



const port = process.env.PORT || 3002

app.get('/test', function(request, response) {
	response.type('text/plain')
	response.send('Node.js and Express running on port='+port)
})

app.listen(port, function() {
	console.log("Server is running at this port: " + port)
})




