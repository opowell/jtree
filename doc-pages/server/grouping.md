Players only interact with members of the same Group. By default, players are all placed in the same single group. The App object contains many fields for defining the grouping behaviour.

First, the group size and/or number of groups can be specified:

- [`app.groupSize`]{@link App#groupSize}: if not null, players will be split into groups of this size according to the [`app.groupingType`]{@link App#groupingType} property (default = NULL).
- [`app.numGroups`]{@link App#numGroups}: number of groups (default = 1).

Second, you can specify how to fill up groups in case the number of participants does not match groupSize x numGroups.

- [`app.groupingType`]{@link App#groupingType}: either
    - FULL (default): as many full groups are made as possible, with the remainder in a non-full group.
    - EVEN: groups are filled up sequentially, making size of all groups as equal as possible.

Third, several types of matching procedures can be used:

- [`app.groupMatchingType`]{@link App#groupMatchingType}:
    - `PARTNER_1122`: group 1 is filled first, then group 2, etc.
    - `PARTNER_1212`: each group is assigned one player, then each group is assigned a second player, etc.
    - `PARTNER_RANDOM`: Stranger matching in first period, in later periods the matching from the previous period is used.
    - `STRANGER` (default): players are assigned random group numbers in every period.

If you require some other type of matching, you can overwrite the [`app.getGroupIdsForPeriod(period)`]{@link App#getGroupIdsForPeriod} function. This function can return two types of objects. If the list returns a single array, then the values in the array are interpreted as group numbers for individual participants in the given period. For example:

```javascript
// app.js
app.groupIds = [
    [1,1,2,2],
    [1,2,1,2]
]
app.getGroupIdsForPeriod = function(period) {
  return this.groupIds[period.id-1] // one row of app.groupIds
}
```

In period 1, the first two participants will be in group 1, and the third and fourth participants will be in group 2.

Alternatively, if the returned object is an array of sub-arrays, then each sub-array is treated as a list of participant IDs for a given group in the period. The following example gives the same matching as in the previous case.

```javascript
// app.js
app.groupIds = [
  [['P1', 'P2'],['P3', 'P4']],
  [['P1', 'P3'],['P2', 'P4']]
]
app.getGroupIdsForPeriod = function(period) {
  return this.groupIds[period.id-1] // one row of app.groupIds
}
```

#### Regrouping when a period starts
In [`app.periodStart(period)`]{@link App#periodStart}, the period's groups and players exist and no group has started yet. [`period.setGroups(matrix)`]{@link Period#setGroups} regroups them, listing each group's participants; every participant once:

```javascript
app.periodStart = function(period) {
    period.setGroups([['P1', 'P4'], ['P2', 'P3']]);
};
```

#### Grouping by arrival
With [`app.groupByArrival`]{@link App#groupByArrival} `true`, participants are grouped in the order they arrive in each period, [`app.groupSize`]{@link App#groupSize} at a time, and a group starts its first stage when it is full. This matters when participants reach the app at different times, for example after an app of instructions that each completes at their own pace.
