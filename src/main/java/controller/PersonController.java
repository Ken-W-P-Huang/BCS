package controller;

import org.apache.commons.collections.map.HashedMap;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

import java.io.IOException;
import java.io.Writer;
import java.util.Map;

/**
 * Created by kenhuang on 2018/10/17.
 */
@Controller

public class PersonController {
    @RequestMapping(value = "/person")
    public String authenticatePerson(){
        System.out.println("person");
        return "person";
    }

    @RequestMapping(value = "/person/data")

    public @ResponseBody Person getData() throws IOException {
        System.out.println("persondata");
        return  new Person("aaa","2222");
    }
    @RequestMapping(value = "/detail")
    public String authenticateDetail(){
        System.out.println("detail");
        return "detail";
    }
    @RequestMapping(value = "/detail/data")
    public @ResponseBody Detail getDetailData(String name,String age){
        if(name== null || name.equals("")){
            name="default";
        }
        if(age== null ||age.equals("")){
            age="100";
        }
        System.out.println("detaildata");
        return new Detail(name ,age);
    }
    @RequestMapping(value = "/pagedata")
    public String authenticatePageData(){
        System.out.println("detail");
        return "pagedata";
    }

}
class Detail{
    String url = "detail";
    String title="Hello,Detail";
    Map<String,String> data = new HashedMap();
    public Detail(String name,String age){
        data.put("name",name);
        data.put("age",age);
    }
    public String getTitle() {
        return title;
    }
    public String getUrl() {
        return url;
    }

    public Map<String, String> getData() {
        return data;
    }
}
class Person{
    String url = "person";
    Map<String,String> data = new HashedMap();
    String title="Hello,person";
    public Person(String name,String age){
        data.put("name",name);
        data.put("age",age);
    }
    public String getUrl() {
        return url;
    }
    public String getTitle() {
        return title;
    }

    public Map<String, String> getData() {
        return data;
    }
}
