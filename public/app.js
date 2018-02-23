

 $(document).ready(function(){
 	//based on which article button clicked, show notes.  or hide, based on toggle of 'show'
	$(".show-notes").click(function(){
		var articleId = $(this).attr("data-id");
		var show = $(this).attr("data-show");

		if(show =='true'){
			$("div[data-note='" + articleId + "']")

				.empty();
			$(this).attr("data-show","false");
		}


		else {
			$(this).attr("data-show","true");
			console.log(JSON.stringify($(this)));
			$.ajax({
				method:"GET",
				url:"/notes/" + articleId
			}).then(function(notes){
				var html = "<ul class='list-group'>";
				console.log("Notes: " + JSON.stringify(notes));
				if(notes.length > 0){
					for (i=0;i<notes.length;i++){
						html += "<li class='list-group-item'>";
						html += "<p>" + notes[i].body + "</p>";
						html += "<a class='btn btn-danger' data-method='delete' href='/delete/" + notes[i]._id + "'>Delete Note</a>";
						html += "</li>";
						
					}			
				};
					html += "</ul>"
					html += "<form action='/create' method='post'>";
					html += "<div class='form-group'>";
					html += "<label for='note'>Note:</label>";
					html += "<textarea class='form-control' rows='3' id='note' data-id='" + articleId + "' name='note'></textarea>";
					html += "<input type='hidden' name='id' value='" + articleId + "'> </input>";
					html += "</div>";
					html += "<button type='submit' class='btn btn-default'>Submit</button>";
					html += "</form>";

				$("div[data-note='" + articleId + "']")
					.append(html)

			})
		}
	});



 })