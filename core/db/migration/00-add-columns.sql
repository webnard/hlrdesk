--begin 00-add-columns 
--Add these changes to the regular sql tables in addition to adding them here so we could eventually remove the extra code here

create or replace function addcol(schemaname varchar, tablename varchar, colname varchar, coltype varchar, colvalue varchar)
--add a column to a table if it does not exist, outputs the result
--if setting a default value, use colvalue, otherwise no need to pass the fifth variable
returns varchar 
language 'plpgsql'
as $$
declare 
    col_name varchar ;
begin 
      execute 'select column_name from information_schema.columns  where  table_schema = ' ||
      quote_literal(schemaname)||' and table_name='|| quote_literal(tablename) || '   and    column_name= '|| quote_literal(colname)    
      into   col_name ;   
      raise info  ' the val : % ', colname;
        if(col_name is null ) then 
            col_name := colname || ' adding column';
            if(colvalue is null) then
                execute 'alter table ' ||schemaname|| '.'|| tablename || ' add column '|| colname || '  ' || coltype; 
            else
                execute 'alter table ' ||schemaname|| '.'|| tablename || ' add column '|| colname || '  ' || coltype || ' default ' || colvalue; 
            end if;
        else
             col_name := colname ||' already exists, not adding';
        end if;
return col_name;
end;
$$


--TODO's
--add a custom price option in the edit item menu?
--have check in window compute prices and add totals
--tests for prices


