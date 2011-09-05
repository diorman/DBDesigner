-- SQL script to create ER diagrams database for PostgreSQL
-- 
-- To run, type: psql template1 < erdiagrams-pgsql.sql

CREATE DATABASE phppgadmin;

\connect phppgadmin

CREATE SCHEMA dbdsgnr;

CREATE TABLE dbdsgnr.erdiagrams(
    erdiagram_id SERIAL,
    name NAME,
    comment TEXT,
    roles_with_privileges OID[],
    owner OID,
    date_created TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    last_update TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    pg_schema OID,
    pg_database OID,
    data TEXT,
    PRIMARY KEY(erdiagram_id),
    UNIQUE (pg_database, pg_schema, name)
);
GRANT USAGE ON SCHEMA dbdsgnr TO PUBLIC;
GRANT SELECT,INSERT,UPDATE,DELETE ON dbdsgnr.erdiagrams TO PUBLIC;
GRANT SELECT,UPDATE ON dbdsgnr.erdiagrams_erdiagram_id_seq TO PUBLIC;

CREATE LANGUAGE plpgsql;
--Trigger for protecting modifications to diagrams
CREATE OR REPLACE FUNCTION dbdsgnr.function_check_user_privileges() RETURNS TRIGGER AS $trigger_check_user_privileges$
    DECLARE
        current_user_oid OID;
        postgres_user_oid OID;
        current_user_has_privileges BOOLEAN;
    BEGIN
        SELECT usesysid INTO current_user_oid FROM pg_catalog.pg_user WHERE usename = current_user;
        SELECT usesysid INTO postgres_user_oid FROM pg_catalog.pg_user WHERE usename = 'postgres';
        current_user_has_privileges := (current_user_oid = ANY(OLD.roles_with_privileges));
        -- check if the user is in a group with privileges
        IF NOT current_user_has_privileges THEN
            SELECT TRUE INTO current_user_has_privileges
            FROM pg_catalog.pg_group
            WHERE
                current_user_oid = ANY (grolist)
                AND grosysid = ANY(OLD.roles_with_privileges);
            IF NOT FOUND THEN
                current_user_has_privileges := FALSE;
            END IF;
        END IF;

        IF TG_OP = 'DELETE' THEN
            IF current_user_oid = OLD.owner OR current_user_oid = postgres_user_oid THEN
                RETURN OLD;
            ELSE 
                RAISE EXCEPTION 'Only the owner and the user postgres have privileges to drop diagram "%"', OLD.name;
            END IF;
        ELSEIF TG_OP = 'UPDATE' THEN
            IF current_user_oid = OLD.owner OR current_user_oid = postgres_user_oid THEN
                NEW.last_update := NOW();
                RETURN NEW;
            ELSEIF NOT current_user_has_privileges THEN
                RAISE EXCEPTION 'You do not have privileges to modify diagram "%"', OLD.name;
            ELSEIF OLD.erdiagram_id != NEW.erdiagram_id OR OLD.roles_with_privileges != NEW.roles_with_privileges
            OR OLD.owner != NEW.owner OR OLD.date_created != NEW.date_created
            OR OLD.pg_schema != NEW.pg_schema OR OLD.pg_database != NEW.pg_database THEN
                RAISE EXCEPTION 'Only the owner and the user postgres can change those properties';
            END IF;
            NEW.last_update := NOW();
            RETURN NEW;
        END IF;
    END;
$trigger_check_user_privileges$ LANGUAGE 'plpgsql';

CREATE TRIGGER trigger_check_user_privileges
    BEFORE UPDATE OR DELETE ON dbdsgnr.erdiagrams
    FOR EACH ROW EXECUTE PROCEDURE dbdsgnr.function_check_user_privileges();