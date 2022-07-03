module.exports.email = {
	service: "Mailgun",
	auth: {
		user: process.env.MONGO_USER || "no-reply@mail.zinimedia.com",
		//pass: "key-b1c1ee97dd7569817804a9e83841a4a3"
		pass: process.env.MONGO_PASSWORD || "ziniteam@123*"
	},
	templateDir: "api/emailTemplates",
	from: "no-reply@kindie.net",
	testMode: false,
	ssl: true
}
