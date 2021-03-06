const common = require("../common/user_module");
const sysfunc = require("../commonFunc")


function checkDataBeforeRegister(userToRegsiter) {
    let errorUsers = []
    let res = new Object();
    res.isPassed = true;
    let line = 1;
    let tmpErr = new Object();
    userToRegsiter.forEach(function (user) {
        line++
        if (user.length != Constants.colRegisterUserExcel.numCell) {
            tmpErr = new Object();
            res.isPassed = false;
            tmpErr.errors = [Constants.errorMsg.cellEmpty]
        } else {
            if (user[Constants.colRegisterUserExcel.sportClub].length > 5)
                user[Constants.colRegisterUserExcel.sportClub] = getClubId(user[Constants.colRegisterUserExcel.sportClub]);
            if (user[Constants.colRegisterUserExcel.idCoach].length > 9)
                user[Constants.colRegisterUserExcel.idCoach] = getCoachId(user[Constants.colRegisterUserExcel.idCoach]);

            tmpErr = checkUser(user)
            user[Constants.colRegisterUserExcel.birthDate] = sysfunc.setBirtdateFormat(user[Constants.colRegisterUserExcel.birthDate])
        }
        if (tmpErr.errors.length > 0) {
            tmpErr.line = line;
            errorUsers.push(tmpErr)
            res.isPassed = false;


        }
    })
    res.results = errorUsers;
    res.users = userToRegsiter;

    return res;
}

function getClubId(line) {
    line = line.split(" ")[line.split(" ").length - 1];
    line = line.substring(0, line.length - 1);
    return parseInt(line)

}

function getCoachId(line) {
    line = line.split(" ")[line.split(" ").length - 1];
    line = line.substring(0, line.length - 1);
    return parseInt(line)

}

function checkUser(user) {
    let err = new Object()
    let collectErr = [];
    let birthDateSplit = user[Constants.colRegisterUserExcel.birthDate].split('/')

    //id user
    if (!validator.isInt(user[Constants.colRegisterUserExcel.idSportsman].toString()) || user[Constants.colRegisterUserExcel.idSportsman].toString().length != 9)
        collectErr.push(Constants.errorMsg.idSportmanErr)
    //firstname

    if (!validator.matches(user[Constants.colRegisterUserExcel.firstName].toString(), Constants.hebRegex) || user[Constants.colRegisterUserExcel.firstName].toString().length < 1)
        collectErr.push(Constants.errorMsg.firstNameHeb)

    //lastname
    if (!validator.matches(user[Constants.colRegisterUserExcel.lastName].toString(), Constants.hebRegex) || user[Constants.colRegisterUserExcel.lastName].toString().length < 2)
        collectErr.push(Constants.errorMsg.lastNameHeb)
    //address
    if (!validator.matches(user[Constants.colRegisterUserExcel.address].toString(), Constants.regexHebrewAndNumbers) || user[Constants.colRegisterUserExcel.address].toString().length < 2)
        collectErr.push(Constants.errorMsg.addressErr)
    //birthDate
    if (birthDateSplit.length != 3 || birthDateSplit[0].length != 2 || birthDateSplit[1].length != 2 || birthDateSplit[2].length != 4)
        collectErr.push(Constants.errorMsg.birthDateErr)
    //phone
    if (!validator.isInt(user[Constants.colRegisterUserExcel.phone].toString()) || user[Constants.colRegisterUserExcel.phone].toString().length != 10)
        collectErr.push(Constants.errorMsg.phoneErr)
    //email
    if (!validator.isEmail(user[Constants.colRegisterUserExcel.email].toString()))
        collectErr.push(Constants.errorMsg.emailErr)
    //sportClub
    if (!validator.isInt(user[Constants.colRegisterUserExcel.sportClub].toString()))
        collectErr.push(Constants.errorMsg.sportClubErr)
    //sex
    if (!(user[Constants.colRegisterUserExcel.sex].toString() in Constants.sexEnum))
        collectErr.push(Constants.errorMsg.sexErr)
    //branch
    if (!(user[Constants.colRegisterUserExcel.sportStyle].toString() in Constants.sportType))
        collectErr.push(Constants.errorMsg.sportTypeErr)
    //id coach
    if (!validator.isInt(user[Constants.colRegisterUserExcel.idCoach].toString(), {gt: 100000000, lt: 1000000000}))
        collectErr.push(Constants.errorMsg.idCoachErr)

    err.errors = collectErr;
    return err;


}

async function insertSportsmanDB(trans, users, sportsmanDetails, i) {
    return trans.sql(` INSERT INTO user_Sportsman (id, firstname, lastname, phone, email, birthdate, address, sportclub, sex,photo)
                                    VALUES (@idSportsman, @firstName, @lastName, @phone, @email, @birthDate, @address, @sportClub, @sex ,@photo)`)
        .parameter('idSportsman', tediousTYPES.Int, sportsmanDetails[Constants.colRegisterUserExcel.idSportsman])
        .parameter('firstName', tediousTYPES.NVarChar, sportsmanDetails[Constants.colRegisterUserExcel.firstName])
        .parameter('lastName', tediousTYPES.NVarChar, sportsmanDetails[Constants.colRegisterUserExcel.lastName])
        .parameter('phone', tediousTYPES.NVarChar, sportsmanDetails[Constants.colRegisterUserExcel.phone])
        .parameter('address', tediousTYPES.NVarChar, sportsmanDetails[Constants.colRegisterUserExcel.address])
        .parameter('birthDate', tediousTYPES.Date, sportsmanDetails[Constants.colRegisterUserExcel.birthDate])
        .parameter('email', tediousTYPES.NVarChar, sportsmanDetails[Constants.colRegisterUserExcel.email])
        .parameter('sportClub', tediousTYPES.Int, sportsmanDetails[Constants.colRegisterUserExcel.sportClub])
        .parameter('sex', tediousTYPES.NVarChar, sportsmanDetails[Constants.colRegisterUserExcel.sex])
        .parameter('sportType', tediousTYPES.NVarChar, sportsmanDetails[Constants.colRegisterUserExcel.sportStyle])
        .parameter('photo', tediousTYPES.NVarChar, Constants.defaultProfilePic)
        .execute()
        .then(async function (testResult) {
            if (i + 1 < users.length)
                await insertSportsmanDB(trans, users, users[i + 1], i + 1)
            return testResult
        })

}

async function insertPasswordDB(trans, users, userDetails, i, userType) {
    return trans.sql(`INSERT INTO user_Passwords (id,password,usertype,isfirstlogin)
                    Values (@idSportsman ,@password,@userType,@isFirstLogin)`)
        .parameter('idSportsman', tediousTYPES.Int, userDetails[Constants.colRegisterUserExcel.idSportsman])
        .parameter('password', tediousTYPES.NVarChar, bcrypt.hashSync(userDetails[Constants.colRegisterUserExcel.idSportsman].toString(), saltRounds))
        .parameter('userType', tediousTYPES.Int, userType)
        .parameter('isFirstLogin', tediousTYPES.Int, 1)
        .execute()
        .then(async function (testResult) {
            if (i + 1 < users.length)
                await insertPasswordDB(trans, users, users[i + 1], (i + 1), userType)
            return testResult
        })
}

async function registerSportsman(users) {
    let ans = new Object()
    let trans;
    await dbUtils.beginTransaction()
        .then(async (newTransaction) => {
            trans = newTransaction;
            await Promise.all(await insertSportsmanDB(trans, users, users[0], 0), await insertPasswordDB(trans, users, users[0], 0, Constants.userType.SPORTSMAN), await insertCoachDB(trans, users, users[0], 0), await insertSportStyleDB(trans, users, users[0], 0)
                .then((result) => {
                    //sendEmail(users);
                    ans.status = Constants.statusCode.ok;
                    ans.results = Constants.msg.registerSuccess;
                    trans.commitTransaction();
                })
                .catch((err) => {
                    ans.status = Constants.statusCode.badRequest;
                    ans.results = err;
                    trans.rollbackTransaction();
                }))
        })
        .fail(function (err) {
            ans.status = Constants.statusCode.badRequest;
            ans.results = err;
            trans.rollbackTransaction();
        })

    return ans
}

async function insertCoachDB(trans, users, sportsmanDetails, i) {
    return trans.sql(`INSERT INTO sportsman_coach (idSportman,idCoach)
                    Values (@idSportsman,@idCoach)`)
        .parameter('idSportsman', tediousTYPES.Int, sportsmanDetails[Constants.colRegisterUserExcel.idSportsman])
        .parameter('idCoach', tediousTYPES.Int, sportsmanDetails[Constants.colRegisterUserExcel.idCoach])
        .execute()
        .then(async function (testResult) {
            if (i + 1 < users.length)
                await insertCoachDB(trans, users, users[i + 1], (i + 1))
            return testResult
        })
}

async function insertSportStyleDB(trans, users, sportsmanDetails, i) {
    return trans.sql(`INSERT INTO sportsman_sportStyle (id, sportStyle)
                    Values (@idSportsman,@sportStyle)`)
        .parameter('idSportsman', tediousTYPES.Int, sportsmanDetails[Constants.colRegisterUserExcel.idSportsman])
        .parameter('sportStyle', tediousTYPES.NVarChar, sportsmanDetails[Constants.colRegisterUserExcel.sportStyle])
        .execute()
        .then(async function (testResults) {
            if (i + 1 < users.length)
                await insertSportStyleDB(trans, users, users[i + 1], (i + 1));
            return testResults;
        })
}

async function sendEmail(users) {
    var subject = 'רישום משתמש חדש wuhsu'
    users.forEach((user) => {
        var textMsg = "שלום " + user[Constants.colRegisterUserExcel.firstName] + "\n" +
            "הינך רשום למערכת של התאחדות האו-שו" + "\n" +
            "אנא בדוק כי פרטיך נכונים,במידה ולא תוכל לשנות אותם בדף הפרופיל האישי או לעדכן את מאמנך האישי" + "\n"
            + "שם פרטי: " + user[Constants.colRegisterUserExcel.firstName] + "\n"
            + "שם משפחה: " + user[Constants.colRegisterUserExcel.lastName] + "\n"
            + "כתובת מגורים: " + user[Constants.colRegisterUserExcel.address] + "\n"
            + "פאלפון: " + user[Constants.colRegisterUserExcel.phone] + "\n"
            + "תאריך לידהי: " + user[Constants.colRegisterUserExcel.birthDate] + "\n"
            + "תעודת זהות: " + user[Constants.colRegisterUserExcel.idSportsman] + "\n"
            + " שם המשתמש והסיסמא הראשונית שלך הינם תעודת הזהות שלך" + "\n\n\n"
            + "בברכה, " + "\n" +
            "מערכת או-שו"
        sysfunc.sendEmail(user[Constants.colRegisterUserExcel.email], textMsg, subject)
    })


}

module.exports.registerSportsman = registerSportsman;
module.exports.checkDataBeforeRegister = checkDataBeforeRegister;
