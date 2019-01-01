

# Getting Started

During the period of learning java web development,I'm always thinking B/S architecture looks like C/S more and more.
If B/S application could be developed as C/S, then the separation of frontend and backend without node.js will come 
true! BC/S is short for Browser Client/Server which I call this architecture(No doubt,it's actually C/S).
This project is just a tiny demo of BC/S concept.  

# Instruction  
The whole trick is in js/patch/bcs.js which make use of window.name parameter to pass data between different windows.

For Get requests triggered by address bar or clicking refresh/back/forward button of browser or href in page content:
1. At the beginning, browser make request to server. For example, http://127.0.0.1/person(might add some extra parms).
2. The application server such as tomcat response to browser with corresponding page through method authenticatePerson
in PersonController.java(same as below).Authentication & Authorization could be executed at the same time.
3. After received the page, the browser will execute method loadPageInfo in bcs.js to load data of this page from server.
4. The server generate JSON response. 
5. Browser could render the page with JSON response using Vue/Avalon.

For Post/Get requests triggered by clicking button etc in page content.
1. we should use ajax to fetch JSON response from server and store it in window.name,then open new/old window using 
window.open(URL,name,specs,replace) function. Another backup solution is using localStorage(userdata in IE6/7) to store 
session data and timestamp as fake session id(considering server might forbid browser to access session id) which could 
be passed through URL parameter. But it's not so elegant.
2. For GET request, the related URL parameters should also added to the URL parameter in window.open function, so that 
refresh/backward/forward button of browser could action as usual.

Here is an IntelliJIDEA plugin to facilitate BC/S development. Please refer to 
https://github.com/Ken-W-P-Huang/lazyfish.

Any comment or commit is welcome.

# JSON Format
The format of JSON transmitted between browser and server should as below:  

window.$page = {
    url:\"detail?name=foo&age=18\",
    data:{},
    title:\"optional\",
    i18n:{optional}
}

# Related Technologies 
Front-end: Avalon(compatible with IE6)/Vue,jQuery,ajax  

Back-end: Java SpringMVC,JSON


