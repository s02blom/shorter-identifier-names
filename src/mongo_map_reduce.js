db.sessions.mapReduce(
    function () {

        var merged = {};
        this.forms.forEach(function (form) {
            for(var key in form) {
                merged[key] = form[key];
            }
        });
        merged.USER_SESSION_ID = this.USER_SESSION_ID;
        merged.snippets = this.snippets;
        merged.forms = this.forms.length;
        merged.trials = this.trials.length;
        emit(this.USER_SESSION_ID, merged);
    },
    function () {},
    {
        "query": { '$and': [
            {'forms':  {'$exists': true}},
            {'trials': {'$exists': true}}
        ]},
        "out": {"inline": true}
    }
)


// http://motor.readthedocs.org/en/latest/api/motor_collection.html#motor.MotorCollection.inline_map_reduce
// "out": {"inline": 1}
// http://docs.mongodb.org/manual/reference/method/db.collection.mapReduce/#mapreduce-out-mtd