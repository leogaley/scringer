var db = require("../models");


//some of these I am sending the response from here, others I am returning a promise.  would need to refactor. 
module.exports = {
	getArticles: function (){
		return db.Article.find({}).sort({Date:-1}) 
	},
	getNotes:function(id){
		return db.Article.findOne({_id:id}).populate("notes")
	},
	addNote:function(req,res){
		db.Note.create({body:req.body.note})
			.then(function(dbNote){
				console.log("dbnote" + dbNote);
				return db.Article.findOneAndUpdate({_id:req.body.id},{$push:{notes:dbNote._id}},{new:true});
			})
			.then(function(dbArticle){
				console.log("dbarticle: " + dbArticle)
				res.redirect('/');
			})
			.catch(function(err){
				res.send(err);
			});
	},
	deleteNote: function(req,res){
		db.Note.findById({_id:req.params.id})
			.then(function(note){
				note.remove()
			})
			.then(function(){
				res.redirect('/');
			})
			.catch(function(err){
				res.send(err);
			})
	}
}
