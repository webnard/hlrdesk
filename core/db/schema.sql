--
-- PostgreSQL database dump
--

-- Dumped from database version 9.3.5
-- Dumped by pg_dump version 9.3.5
-- Started on 2014-12-02 13:12:59 MST

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

--
-- TOC entry 173 (class 3079 OID 11787)
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- TOC entry 1983 (class 0 OID 0)
-- Dependencies: 173
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- TOC entry 171 (class 1259 OID 24616)
-- Name: message_table; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE message_table (
    message_id integer NOT NULL,
    title character varying(50) NOT NULL,
    username character varying(50) NOT NULL,
    posted date DEFAULT ('now'::text)::date
);


ALTER TABLE public.message_table OWNER TO postgres;

--
-- TOC entry 170 (class 1259 OID 24614)
-- Name: message_table_message_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE message_table_message_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.message_table_message_id_seq OWNER TO postgres;

--
-- TOC entry 1984 (class 0 OID 0)
-- Dependencies: 170
-- Name: message_table_message_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE message_table_message_id_seq OWNED BY message_table.message_id;


--
-- TOC entry 172 (class 1259 OID 24660)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE users (
    users character varying(80),
    netid character varying(80),
    username character varying(80)
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 1863 (class 2604 OID 24619)
-- Name: message_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY message_table ALTER COLUMN message_id SET DEFAULT nextval('message_table_message_id_seq'::regclass);


--
-- TOC entry 1866 (class 2606 OID 24621)
-- Name: message_table_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY message_table
    ADD CONSTRAINT message_table_pkey PRIMARY KEY (message_id);


--
-- TOC entry 1868 (class 2606 OID 24623)
-- Name: message_table_title_key; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY message_table
    ADD CONSTRAINT message_table_title_key UNIQUE (title);


--
-- TOC entry 1982 (class 0 OID 0)
-- Dependencies: 5
-- Name: public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM postgres;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO PUBLIC;


-- Completed on 2014-12-02 13:12:59 MST

--
-- PostgreSQL database dump complete
--

