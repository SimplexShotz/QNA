
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

var ans = 0;
var ansID = "";

var prev = "";
var waiting = false;

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

function showHide(show) {
  var hide = ["joinGame", "lobby", "ask", "ans", "vote", "voting", "wait"];
  for (var i = 0; i < hide.length; i++) {
    document.getElementById(hide[i]).style.display = "none";
  }
  if (show) {
    document.getElementById(show).style.display = "block";
  }
  if (show === "wait") {
    waiting = true;
  }
}

function refresh() {
  setTimeout(() => {
    ref.games.once("value", function(data) {
      var d = data.val();
      for (var i in d) {
        if (d[i].pin === gameInfo.pin) {
          gameInfo = d[i];
          gameID = i;
          update(d[i].gameData.state, d[i]);
        }
      }
    });
  }, 0);
}

function update(state, data) {
  switch(state) {
    case "lobby":
      showHide("lobby");
      document.getElementById("showplayers").innerHTML = data.players.length + " / 3";
      var players = "";
      for (var i in data.players) {
        if (i !== "length") {
          players += data.players[i] + "<br>";
        }
      }
      document.getElementById("showplayerlist").innerHTML = players;
    break;
    case "asking":
      prev = "asking";
      if (!waiting) {
        showHide("ask");
      }
      if (data.gameData.questions.length >= 3) {
        ref.games.child(gameID).child("gameData").child("state").set("answering");
        setTimeout(() => {
          waiting = false;
          refresh();
        }, 0);
      }
    break;
    case "answering":
      if (prev !== "answering") {
        waiting = false;
      }
      prev = "answering";
      if (!waiting) {
        showHide("ans");
        var qs = [];
        var ids = [];
        for (var i in data.gameData.questions) {
          if (data.gameData.questions[i].p !== document.getElementById("name").innerHTML) {
            qs.push(data.gameData.questions[i]);
            ids.push(i);
          }
        }
        document.getElementById("questionToAnswer").innerText = qs[ans].q.split("<div>").join("").split("</div>").join("").split("<br>").join("\n");
        ansID = ids[ans];
      }
      var finished = true;
      for (var i in data.gameData.questions) {
        if (i !== "length" && data.gameData.questions[i].a.length !== qs.length - 1) {
          finished = false;
          break;
        }
      }
      if (finished) {
        ref.games.child(gameID).child("gameData").child("state").set("voting");
        setTimeout(() => {
          waiting = false;
          refresh();
        }, 0);
        refresh();
      }
    break;
    case "voting":
      if (prev !== "voting") {
        waiting = false;
      }
      prev = "voting";
      // if (!waiting) {
      showHide("voting");
      // }

    break;
    default:
      alert("[ERROR] State not found.\n\nYour game appears to be broken! Try reloading.");
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
      if (game === undefined) { // Failed to join; creating a new game
        alert("Creating a new game!");
        var data = {
          pin: document.getElementById("pin").innerText,
          players: {
            admin: document.getElementById("name").innerText,
            length: 1
          },
          gameData: {
            state: "lobby",
            questions: {
              length: 0
            }
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
      } else { // Game is full
        if (game.players.length === 3) {
          alert("[ERROR] This game is full!");
          document.getElementById("join").innerText = "Join";
          document.getElementById("join").style.width = "75px";
        } else { // Game is not full
          for (var i in d[id].players) {
            if (d[id].players[i] === document.getElementById("name").innerText) { // Name is taken
              alert("[ERROR] Name already taken!");
              document.getElementById("join").innerText = "Join";
              document.getElementById("join").style.width = "75px";
              id = -1;
            }
          }
          if (id !== -1) { // Successfuly joined
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
            if (d[id].players.length + 1 >= 3) {
              ref.games.child(id).child("gameData").child("state").set("asking");
              refresh();
            }
          }
        }
      }
    });
  }
}
function sendQuestion() {
  var data = {
    q: document.getElementById("question").innerHTML,
    p: document.getElementById("name").innerHTML,
    a: {
      length: 0
    }
  };
  ref.games.child(gameID).child("gameData").child("questions").push(data);
  ref.games.once("value", function(data) {
    var d = data.val();
    for (var i in d) {
      if (d[i].pin === gameInfo.pin) {
        ref.games.child(gameID).child("gameData").child("questions").child("length").set(d[i].gameData.questions.length + 1);
      }
    }
  });
  showHide("wait");
}
function sendAnswer() {
  var data = {
    p: document.getElementById("name").innerHTML,
    a: document.getElementById("answer").innerHTML
  };
  ref.games.child(gameID).child("gameData").child("questions").child(ansID).child("a").push(data);
  var qlength = 0;
  ref.games.once("value", function(data) {
    var d = data.val();
    for (var i in d) {
      if (d[i].pin === gameInfo.pin) {
        qlength = d[i].gameData.questions.length;
        ref.games.child(gameID).child("gameData").child("questions").child(ansID).child("a").child("length").set(d[i].gameData.questions[ansID].a.length + 1);
      }
    }
  });
  ans++;
  if (ans >= qlength - 1) {
    showHide("wait");
  } else {
    refresh();
  }
}

ref.games.on("value", function(data) {
  var d = data.val();
  for (var i in d) {
    if (d[i].pin === gameInfo.pin) {
      gameInfo = d[i];
      gameID = i;
      update(d[i].gameData.state, d[i]);
    }
  }
});
