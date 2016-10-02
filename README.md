# Fork of Botkit demo for Messenger, using Express and Mongo

## Refer Basic Features here [Botkit demo app repo](https://github.com/mvaragnat/botkit-messenger-express-demo)

## Additional Features

* Added plugins loader to modularise all the conversations into separate plugins, refer 
	1. app/controllers/botkit.js => loadPlugins()

* Added service object pattern, refer 
	1. app/services/helloservice.js 
	2. app/services/hellorestservice.js 

* Added view object pattern, refer
	1. app/templates/fb/quickreply.js 

* Made express app object to glbal scope