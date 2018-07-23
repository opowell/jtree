app.description = 'Fancy questionnaire, implemented using the Bootstrap package.'
app.html = `
<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv='Content-Type' content='text/html; charset=utf-8'>
        <link rel="stylesheet" type="text/css" href="shared/bootstrap.min.css">
        <link rel="stylesheet" type="text/css" href="questionnaire-bootstrap/bootstrap-slider.min.css">
        <script src="questionnaire-bootstrap/bootstrap-slider.min.js"></script>
        <script src="shared/bootstrap.min.js"></script>
    </head>
    <body>
        <p>Period: {{period.id}}/{{app.numPeriods}}</p>
        <p id='time-remaining-div'>Time left: {{clock.minutes}}:{{clock.seconds}}</p>
        <span jt-status='active'>
            {{stages}}
        </span>
        <span jt-status='waiting'>
            {{waiting-screen}}
        </span>
    </body>
</html>
`;
// DEFINE STAGES
var questionsStage = app.newStage('questions');
