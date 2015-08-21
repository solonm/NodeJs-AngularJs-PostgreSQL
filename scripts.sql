--Create the table
CREATE TABLE test
(
  id serial NOT NULL,
  name character varying,
  CONSTRAINT test_pkey PRIMARY KEY (id)
);

--Create our Trigger Functions
CREATE OR REPLACE FUNCTION notify_del_trigger()
  RETURNS trigger AS
$BODY$
DECLARE
BEGIN
  PERFORM pg_notify('watchers', TG_TABLE_NAME || '|DELETE|id|' ||  OLD );
  RETURN OLD;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
  
  
CREATE OR REPLACE FUNCTION notify_trigger_ins()
  RETURNS trigger AS
$BODY$
DECLARE
BEGIN
  PERFORM pg_notify('watchers', TG_TABLE_NAME || '|INSERT|id|' ||  NEW );
  RETURN NEW;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
  
  
CREATE OR REPLACE FUNCTION notify_trigger_upd()
  RETURNS trigger AS
$BODY$
DECLARE
BEGIN
  PERFORM pg_notify('watchers', TG_TABLE_NAME || '|UPDATE|id|' ||  NEW );
  RETURN NEW;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;

--Create our Triggers
CREATE TRIGGER watched_table_trigger_del
  AFTER DELETE
  ON test
  FOR EACH ROW
  EXECUTE PROCEDURE notify_del_trigger();


CREATE TRIGGER watched_table_trigger_ins
  AFTER INSERT
  ON test
  FOR EACH ROW
  EXECUTE PROCEDURE notify_trigger_ins();

CREATE TRIGGER watched_table_trigger_upd
  AFTER UPDATE
  ON test
  FOR EACH ROW
  EXECUTE PROCEDURE notify_trigger_upd();

