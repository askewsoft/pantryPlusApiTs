-- gets a group
SET @groupIdTxt = :groupId;
SET @groupId = (SELECT ID FROM GROUP WHERE ID_TXT = @groupIdTxt);

SELECT g.NAME, s.ID_TXT AS ID
FROM GROUP g
JOIN SHOPPER s ON g.OWNER_ID = s.ID
WHERE g.GROUP_ID = @groupId
;