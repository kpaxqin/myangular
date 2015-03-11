/**
 * Created by kpaxqin@github on 15-3-11.
 */
function sayHello(to){
    return _.template("Hello, <%=name %>")({name: to});
}