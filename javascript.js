
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
  var hide = ["joinGame", "lobby", "ask", "ans", "vote", "wait"];
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
  setTimeout(function() {
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
      if (prev !== "lobby") {
        waiting = false;
      }
      prev = "lobby";
      showHide("lobby");
      var playersReady = 0;
      for (var i in data.players) {
        if (i !== "length" && data.players[i].ready) {
          playersReady++;
        }
      }
      document.getElementById("showplayers").innerHTML = playersReady + " / " + (data.players.length);
      var players = "";
      for (var i in data.players) {
        if (i !== "length") {
          players += (data.players[i].ready ? "(Ready) " : "") + data.players[i].name + ": " + data.players[i].score + " points<br>";
        }
      }
      document.getElementById("showplayerlist").innerHTML = players;
      var finished = true;
      for (var i in data.players) {
        if (i !== "length" && !data.players[i].ready) {
          finished = false;
        }
      }
      if (data.players.length < 3) {
        finished = false;
      }
      if (finished) {
        ref.games.child(gameID).child("gameData").child("state").set("asking");
        setTimeout(function() {
          waiting = false;
          refresh();
        }, 0);
      }
    break;
    case "asking":
      if (prev !== "asking") {
        waiting = false;
      }
      prev = "asking";
      if (!waiting) {
        showHide("ask");
      }
      if (data.gameData.questions.length >= data.players.length) {
        ref.games.child(gameID).child("gameData").child("state").set("answering");
        setTimeout(function() {
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
        document.getElementById("questionToAnswer").innerText = qs[ans].q.split("<div>").join("").split("</div>").join("").split("<br>").join("");
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
        setTimeout(function() {
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
      if (!waiting) {
        showHide("vote");
        document.getElementById("answers").innerHTML = "";
        for (var i in data.gameData.questions) {
          if (data.gameData.questions[i].p === document.getElementById("name").innerHTML) {
            document.getElementById("yourQuestion").innerText = data.gameData.questions[i].q.split("<div>").join("").split("</div>").join("").split("<br>").join("");
            for (var j in data.gameData.questions[i].a) {
              if (j !== "length" && j !== "vote") {
                document.getElementById("answers").innerHTML += "<div class=\"btn\" onclick=\"sendVote('" + i + "', '" + j + "')\">" + data.gameData.questions[i].a[j].a + "</div><br>";
              }
            }
          }
        }
      }
      var finished = true;
      for (var i in data.gameData.questions) {
        if (i !== "length" && data.gameData.questions[i].a.vote === "") {
          finished = false;
          break;
        }
      }
      if (finished) {
        for (var i in data.players) {
          if (i !== "length") {
            ref.games.child(gameID).child("players").child(i).child("ready").set(false);
          }
        }
        var dat = {
          length: 0
        };
        ref.games.child(gameID).child("gameData").child("questions").set(dat);
        ans = 0;
        ansID = "";
        document.getElementById("question").innerHTML = "Question";
        document.getElementById("answer").innerHTML = "Answer";
        document.getElementById("ready").innerHTML = "Ready";
        ref.games.child(gameID).child("gameData").child("state").set("lobby");
        setTimeout(function() {
          waiting = false;
          refresh();
        }, 0);
        refresh();
      }
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
            admin: {
              name: document.getElementById("name").innerText,
              score: 0,
              ready: false
            },
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
        document.getElementById("showplayers").innerHTML = "0 / 1";
        setTimeout(function() {
          refresh();
        }, 0);
      } else { // Game has started
        if (game.gameData.state !== "lobby") {
          for (var i in d[id].players) {
            if (d[id].players[i].name === document.getElementById("name").innerText) { // Rejoin
              if (confirm("You are about to rejoin the game.")) {
                gameInfo = d[id];
                var wting = false;
                if (d[id].gameData.state === "asking") {
                  for (var j in d[id].gameData.questions) {
                    if (d[id].gameData.questions[j].p === document.getElementById("name").innerText) {
                      wting = true;
                      break;
                    }
                  }
                }
                if (d[id].gameData.state === "answering") {
                  var cura = 0; // current answer
                  for (var j in d[id].gameData.questions) {
                    for (var k in d[id].gameData.questions[j].a) {
                      if (d[id].gameData.questions[j].a[k].p === document.getElementById("name").innerText) {
                        cura++;
                      }
                    }
                  }
                  ans = cura;
                  if (ans >= d[id].gameData.questions.length - 1) {
                    wting = true;
                  }
                }
                if (d[id].gameData.state === "voting") {
                  for (var j in d[id].gameData.questions) {
                    if (d[id].gameData.questions[j].p === document.getElementById("name").innerText) {
                      if (d[id].gameData.questions[j].a.vote !== "") {
                        wting = true;
                        break;
                      }
                    }
                  }
                }
                console.log(wting);
                if (wting) {
                  showHide("wait");
                } else {
                  refresh();
                }
                id = -1;
                break;
              }
            }
          }
          if (id !== -1) {
            alert("[ERROR] This game has already started!");
          }
          document.getElementById("join").innerText = "Join";
          document.getElementById("join").style.width = "75px";
        } else { // Game has not started (attempt to join)
          for (var i in d[id].players) {
            if (d[id].players[i].name === document.getElementById("name").innerText) { // Name is taken
              if (confirm("That name has already been taken! Continuing will overwrite that player.")) {
                gameInfo = d[id];
                if (d[id].players[i].ready) {
                  document.getElementById("ready").innerHTML = "Unready";
                } else {
                  document.getElementById("ready").innerHTML = "Ready";
                }
                refresh();
              }
              document.getElementById("join").innerText = "Join";
              document.getElementById("join").style.width = "75px";
              id = -1;
            }
          }
          if (id !== -1) { // Successfuly joined
            var playersReady = 0;
            for (var i in d[id].players) {
              if (i !== "length" && d[id].players[i].ready) {
                playersReady++;
              }
            }
            document.getElementById("showplayers").innerHTML = playersReady + " / " + (d[id].players.length + 1);
            var data = {
              name: document.getElementById("name").innerText,
              score: 0,
              ready: false
            };
            ref.games.child(id).child("players").push(data);
            ref.games.child(id).child("players").child("length").set(d[id].players.length + 1);
            setTimeout(function() {
              gameInfo = d[id];
              refresh();
            }, 0);
            gameID = id;
            document.getElementById("joinGame").style.display = "none";
            document.getElementById("lobby").style.display = "block";
            document.getElementById("showpin").innerHTML = document.getElementById("pin").innerText;
          }
        }
      }
    });
  }
}
function ready() {
  ref.games.once("value", function(data) {
    var d = data.val();
    for (var i in d) {
      if (d[i].pin === gameInfo.pin) {
        for (var j in d[i].players) {
          if (j !== "length" && d[i].players[j].name === document.getElementById("name").innerHTML) {
            if (!d[i].players[j].ready) {
              document.getElementById("ready").innerHTML = "Unready";
            } else {
              document.getElementById("ready").innerHTML = "Ready";
            }
            ref.games.child(gameID).child("players").child(j).child("ready").set(!d[i].players[j].ready);
          }
        }
      }
    }
  });
  setTimeout(function() {
    refresh();
  }, 0);
}
function sendQuestion() {
  var data = {
    q: document.getElementById("question").innerHTML,
    p: document.getElementById("name").innerHTML,
    a: {
      vote: "",
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
function sendVote(q, v) {
  // q - question, v - vote
  ref.games.once("value", function(data) {
    var d = data.val();
    for (var i in d) {
      if (d[i].pin === gameInfo.pin) {
        ref.games.child(gameID).child("gameData").child("questions").child(q).child("a").child("vote").set(v);
        for (var j in d[i].players) {
          if (j !== "length" && d[i].players[j].name === d[i].gameData.questions[q].a[v].p) {
            ref.games.child(gameID).child("players").child(j).child("score").set(d[i].players[j].score + 1);
          }
        }
      }
    }
  });
  showHide("wait");
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
