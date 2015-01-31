--
-- PostgreSQL database dump
--

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: checked_out; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE checked_out (
    call character varying(32) NOT NULL,
    copy integer DEFAULT 1 NOT NULL,
    netid character varying(8) NOT NULL,
    attendant character varying(8) NOT NULL,
    extensions integer default 0 not null,
    due date NOT NULL
);


--
-- Name: inventory; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE inventory (
    call character varying(32) NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    volume integer default null,
    title character varying(255)
);


--
-- Name: COLUMN inventory.call; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN inventory.call IS 'The call number for the item. The HLR has varying lengths for its call numbers, so setting it to 32 (the standard for UUIDs) allows us to accommodate all HLR inventory as well as allow for UUIDs for inventory in non-HLR locations.';


--
-- Name: COLUMN inventory.quantity; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN inventory.quantity IS 'How many items are available';


--
-- Name: messages; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE messages (
    message_id integer NOT NULL,
    title character varying(50) NOT NULL,
    username character varying(50) NOT NULL,
    message_body character varying(500),
    posted date DEFAULT ('now'::text)::date
);


--
-- Name: messages_message_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE messages_message_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: messages_message_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE messages_message_id_seq OWNED BY messages.message_id;


--
-- Name: tasks; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE tasks (
    task_id integer NOT NULL,
    task character varying(80) NOT NULL,
    username character varying(50) NOT NULL,
    posted date DEFAULT ('now'::text)::date
);


--
-- Name: tasks_task_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE tasks_task_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tasks_task_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE tasks_task_id_seq OWNED BY tasks.task_id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE users (
    netid character varying(8) NOT NULL
);


--
-- Name: message_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY messages ALTER COLUMN message_id SET DEFAULT nextval('messages_message_id_seq'::regclass);


--
-- Name: task_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY tasks ALTER COLUMN task_id SET DEFAULT nextval('tasks_task_id_seq'::regclass);


--
-- Data for Name: checked_out; Type: TABLE DATA; Schema: public; Owner: -
--

COPY checked_out (call, copy, netid, attendant, due) FROM stdin;
\.


--
-- Data for Name: inventory; Type: TABLE DATA; Schema: public; Owner: -
--

COPY inventory (call, quantity, title) FROM stdin;
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY messages (message_id, title, username, message_body, posted) FROM stdin;
\.


--
-- Name: messages_message_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('messages_message_id_seq', 1, false);


--
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY tasks (task_id, task, username, posted) FROM stdin;
\.


--
-- Name: tasks_task_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('tasks_task_id_seq', 1, false);


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY users (netid) FROM stdin;
\.


--
-- Name: checked_out_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY checked_out
    ADD CONSTRAINT checked_out_pkey PRIMARY KEY (call, copy);


--
-- Name: inventory_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY inventory
    ADD CONSTRAINT inventory_pkey PRIMARY KEY (call);


--
-- Name: messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (message_id);


--
-- Name: tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (task_id);


--
-- Name: users_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_pkey PRIMARY KEY (netid);


--
-- Name: checked_out_attendant_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY checked_out
    ADD CONSTRAINT checked_out_attendant_fkey FOREIGN KEY (attendant) REFERENCES users(netid);


--
-- Name: checked_out_call_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY checked_out
    ADD CONSTRAINT checked_out_call_fkey FOREIGN KEY (call) REFERENCES inventory(call);


--
-- Name: checked_out_netid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY checked_out
    ADD CONSTRAINT checked_out_netid_fkey FOREIGN KEY (netid) REFERENCES users(netid);


--
-- Name: public; Type: ACL; Schema: -; Owner: -
--

REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM postgres;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

