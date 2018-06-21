stage.waitToStart = false;

stage.content = `
<p>The show-up fee was {{app.showUpFee}} Euros.</p>

<p>PART 1</p>
<p>You played {{player.part1Ans}}. Your opponent played {{player.part1PartnerAns}}. You earned {{player.part1Points}} Euros.</p>

<p>PART 2</p>
<span jt-displayIf='player.treatment==1'>
    The randomly chosen participant played {{player.part2PartnerAns}}.
    Your random draw (n) was <span jt-text='player.part2n' jt-decimals=2></span>.
</span>
<span jt-displayIf='player.treatment==2'>
    Of the 20 randomly chosen players, {{player.part2CountOptionB}} played {{app.part1OptionB}}.
</span>
Your guess was {{player.part2Ans}}.
You earned {{player.part2Points}} Euros.

<p>PART 4</p>
<p>
    The first ball you drew was {{player.part4BallColor}}.
    <span jt-displayIf='player.treatment == 1'>
        The additional ball was {{player.part4RandomBall}}, and n was <span jt-text='player.part4n' jt-decimals='2'></span>.
    </span>
    <span jt-displayIf='player.treatment == 2'>
        Of the 20 additional balls, {{player.part4MatchingBalls}} was/were also {{player.part4BallColor}}.
    </span>
    Your guess was {{player.part4Ans}}.
    You earned {{player.part4Points}} Euros.
</p>

<p>PART 5</p>
<p>
    You contributed {{player.part5Cont}} of your endowment of {{app.part5End}}.
    In total, your group contributed <span jt-text='player.part5GroupContributions' jt-decimals=2></span> and produced <span jt-text='player.part5GroupProd' jt-decimals=2></span>.
    Your total income is {{app.part5End}} - {{player.part5Cont}} + ({{player.part5Cont}} + {{player.part5GroupContributions - player.part5Cont}}) x {{player.part5Mult}}/{{player.part5GroupPlayerIds.length}} = <span jt-text='player.part5Points' jt-decimals=2></span> points.
    Each point is converted to {{app.part5ExchRate}} Euros, therefore you earned {{player.part5Eur}} Euros.
</p>

<p>PART 6</p>
<p>
    Task 1: You chose {{player.part6LowQ}}.
    Of the four randomly chosen players, {{player.part6CountLowQ}} contributed less than your choice. You earned {{player.part6LowQPoints}} Euros.
</p>
<p>
    Task 2: You chose {{player.part6Med}}.
    Of the two randomly chosen players, {{player.part6CountMed}} contributed more than your choice. You earned {{player.part6MedPoints}} Euros.
</p>
<p>
    Task 3: You chose {{player.part6UpQ}}.
    Of the four randomly chosen players, {{player.part6CountUpQ}} contributed more than your choice. You earned {{player.part6UpQPoints}} Euros.
</p>
<p><b>TOTAL PAYOFF</b></p>
Including show-up fee and all parts: <b>{{player.points}} Euros</b>.
`

stage.waitToEnd = false;
