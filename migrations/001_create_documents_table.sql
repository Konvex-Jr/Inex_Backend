-- public.documents definition

-- DROP TABLE public.documents;

CREATE TABLE IF NOT EXISTS public.documents (
    id serial PRIMARY KEY,
    content text NOT NULL,
    embedding float8[] NOT NULL
);
