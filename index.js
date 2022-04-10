const express = require('express');
const basicAuth = require('express-basic-auth');
const ejs = require('ejs');
const fs = require('fs');
const mysql = require('mysql');

const app = express();
app.use(express.urlencoded({extended: true}));
app.set("view engine", "ejs");

var conn = mysql.createConnection({
    host:"localhost",
    user: "root",
    password: "",
    database: "pokemon"
  });

/* //JSON Version
app.use(basicAuth({authorizer: myAuthorizer, challenge: false, authorizeAsync: false}));
function myAuthorizer(username, password){
    const data = JSON.parse(fs.readFileSync("logins.json"));
    const logins = data.filter(login => basicAuth.safeCompare(password, login.password) && basicAuth.safeCompare(username, login.username));
    return logins.length > 0;
}
*/

//MYSQL Version
//app.use(basicAuth({authorizer: myAuthorizer, challenge: false, authorizeAsync: true}));
//MYSQL Version + EJS
app.use(basicAuth({authorizer: myAuthorizer, challenge: true, authorizeAsync: true}));
function myAuthorizer(username, password, cb){
    conn.query("SELECT COUNT(id) as cnt FROM logins WHERE username=? and password=?", [username, password], (error, results, fields) => {
        if(error) throw error;
        return cb(null, results[0].cnt > 0);
      });
}

/* //JSON Version
app.route('/api/pokemon')
    .get((req, res) => { //query string
        const data = JSON.parse(fs.readFileSync("db.json"));
        res.send(data);
    })
    .post((req, res) => { //body
        let data = JSON.parse(fs.readFileSync("db.json"));
        data.push({name: req.body.name, type: req.body.type, level: req.body.level});
        fs.writeFileSync("db.json", JSON.stringify(data));
        res.send("Record added succesfully!");
    })
    .put((req, res) => { //nelle query string passiamo pokemon da modificare, nel body i nuovi dati
        let data = JSON.parse(fs.readFileSync("db.json"));
        let pokemon = data.find((item) => item.name == req.query.name);
        data[data.indexOf(pokemon)] = {name: req.body.name, type: req.body.type, level: req.body.level};
        fs.writeFileSync("db.json", JSON.stringify(data));
        res.send("Record edited succesfully!");
    })
    .delete((req, res) => { //query string
        let data = JSON.parse(fs.readFileSync("db.json"));
        data = data.filter((item) => item.name != req.query.name);
        fs.writeFileSync("db.json", JSON.stringify(data));
        res.send("Record deleted succesfully!");
    });
*/

//MYSQL Version
app.route('/api/pokemon')
    .get((req, res) => { //query string
        conn.query("SELECT * FROM pokemon", (error, results, fields) => {
            if(error) throw error;
            res.send(results);
          });
    })
    .post((req, res) => { //body
        conn.query("INSERT INTO pokemon (name, type, level) VALUES (?, ?,?)", [req.body.name, req.body.type, req.body.level], (err, result) => {
            if (err) throw err;
            res.send("Record added succesfully!");
          });
    })
    .put((req, res) => { //body
        conn.query("UPDATE pokemon SET name = ?, type = ?, level = ? WHERE id = ?",[req.body.name, req.body.type, req.body.level, req.body.id], (err, result) => {
            if (err) throw err;
            res.send("Record edited succesfully!");
        });
    })
    .delete((req, res) => { //query string
        conn.query("DELETE FROM pokemon WHERE id = ?",[req.query.id], (err, result) => {
            if (err) throw err;
            res.send("Record deleted succesfully!");
        });
    });

app.route('/pokedex')
    .get((req, res) => { //query string
        conn.query("SELECT * FROM pokemon", (error, results, fields) => {
            if(error) throw error;
            console.log(results);
            res.render("pokedex",{items:results});
          });
    });

app.route('/pokedex/insert')
    .get((req, res) => { //query string
        res.render("insert");
    })
    .post((req, res) => { //body
        conn.query("INSERT INTO pokemon (name, type, level) VALUES (?, ?,?)", [req.body.name, req.body.type, req.body.level], (err, result) => {
            if (err) throw err;
            res.redirect("/pokedex");
          });
    });

app.route('/pokedex/update')
    .get((req, res) => { //query string
        conn.query("SELECT * FROM pokemon", (error, results, fields) => {
            if(error) throw error;
            res.render("update", {items: results});
        });
    })
    .post((req, res) => { //body
        conn.query("UPDATE pokemon SET name = ?, type = ?, level = ? WHERE id = ?",[req.body.name, req.body.type, req.body.level, req.body.id], (err, result) => {
            if (err) throw err;
            res.redirect("/pokedex")
            });
    });

app.route('/pokedex/delete')
    .get((req, res) => { //query string
        conn.query("SELECT * FROM pokemon", (error, results, fields) => {
            if(error) throw error;
            res.render("delete", {items: results});
        });
    })
    .post((req, res) => { //body
        conn.query("DELETE FROM pokemon WHERE id = ?",[req.body.id], (err, result) => {
            if (err) throw err;
            res.redirect("/pokedex")
            });
    });

app.listen(3000, () => {
    console.log('Server accessible via: http://localhost:3000/api/pokemon');
    console.log('Server accessible via: http://localhost:3000/pokedex');
});