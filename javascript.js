
// Distance
// We have a long way to go...
// (distance)
// I've always wondered how the earth spins 'round...
// (distance)
// You are nearly there.

// Initialize Firebase
var config = {
  apiKey: "AIzaSyCufbhWNY_sUSYuIAE5RTEAH34YcWqN5VQ",
  authDomain: "qna-6a69e.firebaseapp.com",
  databaseURL: "https://qna-6a69e.firebaseio.com",
  projectId: "qna-6a69e",
  storageBucket: "",
  messagingSenderId: "782111386544"
};
firebase.initializeApp(config);

var database = firebase.database();
var ref = {
	games: database.ref("games"),

};

/*

ref.userlist.once("value", function(data) {
  var d = data.val();
  var userExists = false;
  for (var i in d) {
    if (d[i].username === username) {
      error("That user already exists! Try logging in instead.");
      userExists = true;
      break;
    }
  }
  if (!userExists) {
    var data = {
      username: username,
      password: password
    }
    ref.userlist.push(data);
    success("Signed up successfuly!<br>Please login.");
  }
});

*/

var gameID = "";
var gameInfo = {};

function checkU() {
  if (document.getElementById("name").innerText.split("").length > 12) {
    document.getElementById("name").innerText = document.getElementById("name").innerText.split("").splice(0, 12).join("");
  }
}
function checkP() {
  if (document.getElementById("pin").innerText.split("").length > 4) {
    document.getElementById("pin").innerText = document.getElementById("pin").innerText.split("").splice(0, 4).join("");
  }
}

function update(state, data) {
  switch(state) {
    case "lobby":
      console.log(data);
      document.getElementById("showplayers").innerHTML = data.players.length + " / 3";
      var players = "";
      for (var i in data.players) {
        if (i !== "length") {
          players += data.players[i] + "<br>";
        }
      }
      document.getElementById("showplayerlist").innerHTML = players;
    break;
    default:
      alert("[ERROR] State not found.\n\nYour game appears to be broken! Try reloading.")
  }
}

function join() {
  if (document.getElementById("pin").innerText.split("").length <= 4 && document.getElementById("name").innerText.split("").length <= 12) {
    document.getElementById("join").innerText = "Joining...";
    document.getElementById("join").style.width = "100px";
    ref.games.once("value", function(data) {
      var d = data.val();
      var game, id;
      for (var i in d) {
        if (d[i].pin === document.getElementById("pin").innerText) {
          game = d[i];
          id = i;
          break;
        }
      }
      if (game === undefined) {
        alert("creating a new game");
        var data = {
          pin: document.getElementById("pin").innerText,
          players: {
            admin: document.getElementById("name").innerText,
            length: 1
          },
          gameData: {
            state: "lobby",
            questions: []
          }
        };
        // questions: [{
        //   q: "", // question
        //   p: "", // player who asked
        //   a: [] // answers
        // } ... ]
        ref.games.push(data);
        gameInfo = data;
        document.getElementById("joinGame").style.display = "none";
        document.getElementById("lobby").style.display = "block";
        document.getElementById("showpin").innerHTML = document.getElementById("pin").innerText;
        document.getElementById("showplayers").innerHTML = "1 / 3";
        document.getElementById("showplayerlist").innerHTML = document.getElementById("name").innerText;
      } else {
        if (game.players.length === 3) {
          alert("error, game already has 3 players");
        } else {
          alert("game found, joining");
          for (var i in d[id].players) {
            if (d[id].players[i] === document.getElementById("name").innerText) {
              alert("name already taken");
              id = -1;
            }
          }
          if (id !== -1) {
            alert("game now has " + (d[id].players.length + 1) + " players");
            document.getElementById("showplayers").innerHTML = (d[id].players.length + 1) + " / 3";
            var players = "";
            for (var i in d[id].players) {
              if (i !== "length") {
                players += d[id].players[i] + "<br>";
              }
            }
            players += document.getElementById("name").innerText;
            document.getElementById("showplayerlist").innerHTML = players;
            ref.games.child(id).child("players").push(document.getElementById("name").innerText);
            ref.games.child(id).child("players").child("length").set(d[id].players.length + 1);
            setTimeout(() => {
              gameInfo = d[id];
            }, 0);
            gameID = id;
            document.getElementById("joinGame").style.display = "none";
            document.getElementById("lobby").style.display = "block";
            document.getElementById("showpin").innerHTML = document.getElementById("pin").innerText;
          }
        }
      }
    });
    document.getElementById("join").innerText = "Join";
    document.getElementById("join").style.width = "75px";
  }
}

ref.games.on("value", function(data) {
  var d = data.val();
  for (var i in d) {
    if (d[i].pin === gameInfo.pin) {
      gameInfo = d[i];
      update(d[i].gameData.state, d[i]);
    }
  }
});








//
