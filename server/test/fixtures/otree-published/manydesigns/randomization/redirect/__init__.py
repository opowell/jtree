from otree.api import *
import csv
import random
import time
from scipy.stats import rankdata
from math import ceil


doc = """
ManyDesigns:
- Randomization + Redirect
"""


class Constants(BaseConstants):
    name_in_url = 'redirect'
    players_per_group = None
    num_rounds = 1

    with open('redirect/urls.csv', encoding='utf-8') as file:
        csv = list(csv.DictReader(file))
    urls = []
    for col in csv:
        urls.append(col['url'])

    num_urls = len(urls)    # save number of URLs

    num_participants = 2000

    num_url_reps_needed = ceil(num_participants / (num_urls * 4))
    urls_rep = range(0, num_url_reps_needed)
    rep_seed = [i * 42 + 20220128 for i in urls_rep]

    urlsfull = []
    for rep in urls_rep:
        rng = random.Random(rep_seed[rep])
        urls_copy = urls.copy()
        rng.shuffle(urls_copy)

        # for url in urls_copy:
        #     urlsfull.append(url + 'TEST')  # remove 'TEST' when in production
        #     urlsfull.append(url + 'TEST')
        #     urlsfull.append(url + 'TEST')
        #     urlsfull.append(url + 'TEST')
        for url in urls_copy:
            urlsfull.append(url)
            urlsfull.append(url)
            urlsfull.append(url)
            urlsfull.append(url)


class Subsession(BaseSubsession):
    pass


class Group(BaseGroup):
    pass


class Player(BasePlayer):

    time_entered = models.FloatField(initial=4102398000)    # set initial to 31.12.2099
    url = models.StringField()


# ------------------------------------------------------------------------------
# PAGES


class RedirectWait(Page):

    timeout_seconds = 0

    @staticmethod
    def before_next_page(player, timeout_happened):
        player.time_entered = time.time()
        participant = player.participant
        others = player.get_others_in_subsession()
        time_others = []
        for p in others:
            time_others.append(getattr(p, 'time_entered'))
        time_all = [player.time_entered] + time_others
        ranks = rankdata(time_all, method = 'max')
        participant.rank = ranks[0]

        player.url = Constants.urlsfull[int(participant.rank)-1]

        if '{{%PROLIFIC_PID%}}' in player.url:
            if participant.label is not None:
                player.url = player.url.replace('{{%PROLIFIC_PID%}}', str(participant.label))
            else:
                player.url = player.url.replace('{{%PROLIFIC_PID%}}', str(int(round(time.time()*100, 0))) + 'player' + str(player.id_in_subsession))
        if '{{%STUDY_ID%}}' in player.url:
            player.url = player.url.replace('{{%STUDY_ID%}}', 'manydesigns_' + str(int(round(time.time()*100, 0))))
        if '{{%SESSION_ID%}}' in player.url:
            player.url = player.url.replace('{{%SESSION_ID%}}', str(int(round(time.time()*100, 0))) + 'player' + str(player.id_in_subsession))


class Redirect(Page):

    def vars_for_template(player):

        participant = player.participant

        return dict(
            urlsfull=Constants.urlsfull,
            length=len(Constants.urlsfull),
            playerurl=player.url,
            rank = participant.rank
        )

    @staticmethod
    def js_vars(player):
        session = player.session
        return dict(
            playerurl=player.url
        )


page_sequence = [RedirectWait, Redirect]
