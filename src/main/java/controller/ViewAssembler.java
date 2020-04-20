

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.net.URISyntaxException;
import java.net.URL;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Created by kenhuang on 2020/3/18.
 */
@Component
public class ViewAssembler {
    private static String headTag = "<head>";
    private static int headTagLength = ViewAssembler.headTag.length();
    private static String scriptStartTag = "<script type=\"text/javascript\">var pageInfo =";
    private static String scriptEndTag = "</script>";
    private Map<String,String> htmlBuffer = new ConcurrentHashMap<>(100);
    private ObjectMapper jsonMapper = new ObjectMapper();

    public ViewAssembler() {
        //在反序列化时忽略在 json 中存在但 Java 对象不存在的属性
        this.jsonMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        //在序列化时日期格式默认为 yyyy-MM-dd'T'HH:mm:ss.SSSZ
        this.jsonMapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS,false);
        //在序列化时忽略值为 null 的属性
        this.jsonMapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);
        //忽略值为默认值的属性
        this.jsonMapper.setDefaultPropertyInclusion(JsonInclude.Include.NON_DEFAULT);
    }

    /**
     * 将object转为json，并生成<script type="text/javascript">var pageInfo=objectJSON</script>
     * 插入到viewAddress所指定的html文件流中
     * @param viewPath html文件路径
     * @param model
     * @return
     */
    public String addModelToView(String viewPath, Object model) throws IOException, URISyntaxException {
        String line,htmlContent = this.htmlBuffer.get(viewPath);
        File file = new File(viewPath);
        if (!file.exists()){
            URL url = ViewAssembler.class.getClassLoader().getResource(viewPath);
            file = new File(url.toURI());
        }
        assert file.exists();
        if (htmlContent == null){
            htmlContent = "";
            BufferedReader stream = new BufferedReader(new FileReader(file));
            while ((line = stream.readLine()) != null) {
                htmlContent += line;
                htmlContent += System.lineSeparator();
            }
        }
        this.htmlBuffer.put(file.getAbsolutePath(),htmlContent);
        /*使用replaceFirst会因为JSON字符串太长，导致IllegalArgumentException异常。*/
        int index = htmlContent.indexOf(ViewAssembler.headTag ) + ViewAssembler.headTagLength;
        String startContent = htmlContent.substring(0,index);
        String endContent = htmlContent.substring(index);
        return startContent + ViewAssembler.scriptStartTag + this.jsonMapper.writeValueAsString(model)
                +ViewAssembler.scriptEndTag + endContent;
    }
}
