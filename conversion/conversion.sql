DROP VIEW IF EXISTS new_checked_out;

CREATE VIEW new_checked_out AS
  SELECT `COPY` `copy`, `callnumber` `call`, `NETID` `netid`, `DUEDATETIME` `due`,
  '::ROBO::' `attendant`
  FROM `checkout` JOIN
  titles ON titles.AQNO = checkout.AQNO;
