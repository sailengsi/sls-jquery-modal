查看在线demo：[https://demo.sailengsi.com/sls-jquery-modal/release/](https://demo.sailengsi.com/sls-jquery-modal/release/ "在线演示")
查看在线文档：[https://doc.sailengsi.com/sls-jquery-modal-doc/](https://doc.sailengsi.com/sls-jquery-modal-doc/ "查看在线文档")

插件采用UMD模式编写，所以同时也兼容cmd,amd模式。

项目采用fis编写，fis官网地址：[http://fis.baidu.com/](http://fis.baidu.com/ "fis文档")   
所以你需要按照以下步骤才能运行此项目


	//克隆项目
	git clone https://github.com/sailengsi/sls-jquery-modal.git
	
	//进入项目中的dev目录
	cd sls-jquery-modal/dev
	
	//安装依赖
	npm install
	
	//编译
	npm run build
	
	//启动Server
	npm start
	
	//停止Server
	npm stop

注意：npm run build时，会在项目根目录(sls-jquery-modal)中创建release目录，此目录是把dev目录编译之后而生成，而npm start启动的服务，实际上是访问的release目录。

如果你想修改一下内容，需要执行npm run watch,执行之后，你只需要更改dev目录中的内容，浏览器就会自动刷新。

但是你执行完watch命令之后，在你的release目录中的所有html中，会自动引入一个http://你的局域网ip:8132/livereload.js，有了这个，才能保证你只要更改代码，浏览器才会自动刷新。

所以，当你改完之后，务必再执行一次npm run build,此命令只编译，不监听，会把livereload.js给去掉。