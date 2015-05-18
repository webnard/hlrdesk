DROP VIEW IF EXISTS users;

CREATE VIEW users AS
  SELECT * FROM (
    SELECT NetID netid, TRUE admin FROM employee
    UNION ALL
    SELECT NetID netid, netid IN(SELECT NetID FROM employee) admin FROM reserveout
    UNION ALL
    SELECT NetID netid, netid IN(SELECT NetID FROM employee) admin FROM checkout
  ) all_users GROUP BY netid
  ;

DROP VIEW IF EXISTS checked_out;

CREATE VIEW checked_out AS
  SELECT
  `COPY` `copy`,
  `callnumber` `call`,
  `NETID` `netid`,
  `DUEDATETIME` `due`,
  '::ROBO::' `attendant` -- the attendants aren't listed, so make an obviously fake one
  FROM `checkout` JOIN
  titles ON titles.AQNO = checkout.AQNO

  UNION ALL

  SELECT
  `COPY` `copy`
  `callnumber` `call`,
  `NETID` `netid`,
  `DUEDATETIME` `due`,
  '::ROBO::' `attendant` -- the attendants aren't listed, so make an obviously fake one
  FROM `reserveout` JOIN
  titles ON titles.AQNO = reserveout.AQNO
  ;

DROP VIEW IF EXISTS inventory;

-- TODO: are volumes applicable here at all?
CREATE VIEW inventory AS
  -- TITLES TABLE
  SELECT
  callnumber `call`,
  title,
  (SELECT COUNT(*) FROM titles WHERE callnumber = `call`) quantity,
  IF(
    STR_TO_DATE(`aquired`,'%m-%d-%y') IS NULL,
    STR_TO_DATE(`aquired`,'%m/%d/%y'),
    STR_TO_DATE(`aquired`,'%m-%d-%y')
  ) date_added,
  IF(`online`, TRUE, FALSE) on_hummedia,
  notes,
  FALSE is_reserve,
  IF(`duplicate` = 'Y', TRUE, FALSE) is_duplicatable
  FROM titles WHERE `callnumber` NOT IN(SELECT `callnumber` FROM reserveitems)

  UNION ALL

  -- RESERVE TABLE
  SELECT
  callnumber `call`,
  title,
  (SELECT COUNT(*) FROM `reserveitems` WHERE callnumber = `call`) quantity,
  NULL date_added,
  NULL on_hummedia,
  CONCAT(
    notes, ' [',
    'Return Type: ', returntype, '. ',
    'Instructor: ', instructor, '. ',
    'Dropped by: ', droppedby, '.]'
  ) notes,
  TRUE is_reserve,
  FALSE is_duplicatable
  FROM reserveitems
  ;

DROP VIEW IF EXISTS media_items;

CREATE VIEW media_items
  SELECT description `medium`, call_number `call`
  FROM titles JOIN media ON media.code = titles.media;
