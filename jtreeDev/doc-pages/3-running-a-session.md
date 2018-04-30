This tutorial shows how to start and run a session. We will use an implementation of the public goods game described in Box 1 that comes included with jtree. The tutorial that follows this one will show you how to actually build the corresponding app.

*Box 1* - Description of the simple public goods game.
A group of N players is given an endowment E from which they may contribute a certain amount ci to the creation of a public good. The total amount produced of the public good G = a * sum (ci) is a function of the sum of contributions and a production factor a \in (1, N). The public good is then divided equally among all players in the group. The payoff to player i is then E - ci + G/N.

Follow these steps to run a session:

1. Create a session: From the “Session” menu, click “New”. The Participant panels will refresh and show a ready page. Note the session name in the Info panel (something like 20171018-121500-000).
2. Add an app: From the Info panel, select “public-goods” from the “Apps” dropdown list, then click the “add” button.
3. Start the session: Click the “Start / advance slowest” button.
4. Turn on autoplay: From the Participants section, click “start autoplay”. The individual Participant panels will start to play the game automatically.

The Participants table displays information about all participants. Once all participants have finished playing an app, output for that app is written to the session output file. This is a comma-separated value file located at `<jtree>/sessions/<sessionId>/<sessionId>.csv`, where `<jtree>` is the location of the jtree executable, and `<sessionid>` is the name of the session. The last few lines of this file are a list of all session participants and how many points they earned.
