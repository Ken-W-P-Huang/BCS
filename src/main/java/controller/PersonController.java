package com.easepal.controller;

import org.apache.commons.collections.map.HashedMap;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.io.IOException;
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

    public @ResponseBody Person getData(String name,String age) throws IOException {
        System.out.println("persondata");
        if(name== null || "".equals(name)){
            name="default";
        }
        if(age== null || "".equals(age)){
            age="11";
        }
        return  new Person(name,age);
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

    @RequestMapping(value = "/vue")
    public String vue(){
        System.out.println("vue");
        return "vue";
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
