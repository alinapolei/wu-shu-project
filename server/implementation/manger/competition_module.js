
var status={
    close: 'סגור',
    open : 'פתוח',
    regclose :'רישום סגור'
}

function addCompetition(req, res) {
    let validator = new validation(req.body, {
        location: 'required',
        eventDate: 'required',
        startHour: 'required',
        sportStyle: 'required',
        closeDate: 'required',
        closeTime: 'required',
        description: 'required',
        city: 'required'
    });
    var regexHebrew = new RegExp("^[\u0590-\u05fe _]*[\u0590-\u05fe][\u0590-\u05fe _]*$");
    var regexHebrewAndNumbers = new RegExp("^[\u0590-\u05fe0-9 _]*[\u0590-\u05fe0-9][\u0590-\u05fe0-9 _]*$");
    validator.check().then(function (matched) {
        if (!matched) {
            res.status(400).send(validator.errors);
        } else if (!regexHebrew.test(req.body.description)) {
            res.status(400).send("Description name must be in hebrew");
        } else if (!regexHebrewAndNumbers.test(req.body.location)) {
            res.status(400).send("Location name must be in hebrew");
        } else if (req.body.eventDate.split("/").length != 3) {
            res.status(400).send("The eventDate must be a valid date");
        } else if (req.body.startHour.split(":").length != 2) {
            res.status(400).send("The startHour must be a valid date");
        } else if (req.body.closeDate.split("/").length != 3) {
            res.status(400).send("The closeDate must be a valid date");
        } else if (req.body.closeTime.split(":").length != 2) {
            res.status(400).send("The closeTime must be a valid date");
        } else if (req.body.sportStyle != 'טאולו' && req.body.sportStyle != 'סנדא') {
            res.status(400).send("The sportStyle must be valid");
        } else if (!regexHebrewAndNumbers.test(req.body.city)) {
            res.status(400).send("city name must be in hebrew");
        } else {
            DButilsAzure.execQuery(` INSERT INTO events (location,type,date,startHour,city)
                                    output inserted.idEvent
                                    VALUES ('${req.body.location}','${eventType.competition}','${req.body.eventDate}','${req.body.startHour}','${req.body.city}');`)
                .then((result) => {
                    DButilsAzure.execQuery(` INSERT INTO events_competition (sportStyle,description,closeRegDate,closeRegTime,status,idEvent)
                                    VALUES ('${req.body.sportStyle}','${req.body.description}','${req.body.closeDate}','${req.body.closeTime}','${status.open}','${result[0].idEvent}');`)

                        .then((result1) => {
                            res.status(200).send("Competition addded successfully")
                        })
                        .catch((eror) => {
                            res.status(400).send(eror)
                        })
                })
                .catch((eror) => {
                    res.status(400).send(eror)
                })
        }
    })
}

function editCompetition(req, res) {
    DButilsAzure.execQuery(` Update events 
                                    set location ='${req.body.location}',type='${eventType.competition}',date=''${req.body.eventDate}',startHour='${req.body.startHour}'
                                    where idEvent ='${req.body.eventId}';`)
        .then((result) => {
            DButilsAzure.execQuery(` Update events_competition 
                                            set sportStyle=${req.body.sportStyle},description='${req.body.description}',closeRegDate='${req.body.closeDate}',closeRegTime='${req.body.closeTime}',status=''${req.body.status}
                                            where idCompetition ='${req.body.idCompetition}';`)
                .then((result1)=>{
                    res.status(200).send("Competition update successfully")
                })
                .catch((eror)=>{res.status(400).send(eror)})
        })
        .catch((eror) => {res.status(400).send(eror)})
}

function getAllCompetitions(req ,res){
    let isOpen = req.query.isOpen != null && req.query.isOpen !== undefined ? (req.query.isOpen == 'true' ? 'פתוח' : 'סגור') : '';
    let query = `select events_competition.idCompetition,events_competition.sportStyle ,events_competition.status,events_competition.closeRegDate, events.date from events_competition
                                   left join events on events_competition.idEvent = events.idEvent`;
    let queryCount = `select count(*) as count from events_competition 
                        left join events on events_competition.idEvent = events.idEvent`;
    if(isOpen !== '') {
        let whereStat = ` where events_competition.status like '${isOpen}'`;
        query += whereStat;
        queryCount += whereStat;
    }
    query += ` order by events.date`;

    Promise.all([DButilsAzure.execQuery(query), DButilsAzure.execQuery(queryCount)])
        .then(result => {
            resultJson = {
                competitions : result[0],
                totalCount : result[1][0].count
            };
            res.status(200).send(resultJson);
        })
        .catch((error) => {
            res.status(400).send(error)
        });
}

function getAllSportsman(req,res){
     DButilsAzure.execQuery(`select id,firstname,lastname from user_Sportsman`)
         .then((result) => {
             res.status(200).send(result)
         })
         .catch((err) => {res.status(400).send(err)})
}



module.exports._addCompetition = addCompetition;
module.exports._getCompetition =getAllCompetitions;
module.exports._getAllSportsman =getAllSportsman;