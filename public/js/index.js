$('#create-a-session-button').click(() => {
	console.log('tu as cliquer')


	
})
// $.ajax('/create_session', { data: { comment: 'texttext' },
// 	type: "POST",
// 	beforeSend: function() {
// 		alert("before send");
// 	},
// 	error: function() {
// 		alert("error"); 
// 	},
// 	success: function(data) {
// 		alert(data);    
// 	}
// });
$.ajax({
	type: 'POST',
	url: 'http://127.0.0.1:3000/create_session',
	data: undefined,
	dataType: 'json',
	success: (data) => {
		console.log('SUCCESS')
		console.log(data)
	},
	error: (data) => {
		console.log('ERROR')
		console.log(data)
	}
});