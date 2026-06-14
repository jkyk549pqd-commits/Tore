/**
 * 代码生成器 Composable
 * 提供多种编程语言的代码模板和示例代码生成功能
 */
import { ref, computed } from "vue";
import { ElMessage } from "element-plus";

export function useCodeGenerator() {
  /**
   * 代码模板库
   * 按语言分类，包含不同场景的示例代码
   */
  const codeTemplates = {
    javascript: {
      hello: {
        label: "Hello World",
        code: `console.log("Hello, World!");`,
      },
      class: {
        label: "类定义",
        code: `class MyClass {
  constructor(name) {
    this.name = name;
  }

  greet() {
    console.log(\`Hello, \${this.name}!\`);
  }

  getInfo() {
    return {
      name: this.name,
      timestamp: new Date().toISOString()
    };
  }
}

// 使用示例
const myInstance = new MyClass("Developer");
myInstance.greet();
console.log(myInstance.getInfo());`,
      },
      async: {
        label: "异步函数",
        code: `// 异步函数示例
async function fetchData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
}

// Promise.all 示例
async function fetchMultiple(urls) {
  try {
    const promises = urls.map(url => fetch(url).then(res => res.json()));
    const results = await Promise.all(promises);
    return results;
  } catch (error) {
    console.error("Batch fetch error:", error);
    throw error;
  }
}

// 使用示例
const data = await fetchData('/api/users');
console.log(data);`,
      },
      array: {
        label: "数组操作",
        code: `// 数组操作示例
const numbers = [1, 2, 3, 4, 5];

// map - 转换数组
const doubled = numbers.map(n => n * 2);
console.log("Doubled:", doubled);

// filter - 过滤数组
const evens = numbers.filter(n => n % 2 === 0);
console.log("Evens:", evens);

// reduce - 累加数组
const sum = numbers.reduce((acc, n) => acc + n, 0);
console.log("Sum:", sum);

// find - 查找元素
const found = numbers.find(n => n > 3);
console.log("Found:", found);

// sort - 排序数组
const sorted = [...numbers].sort((a, b) => b - a);
console.log("Sorted descending:", sorted);`,
      },
      object: {
        label: "对象操作",
        code: `// 对象操作示例
const user = {
  name: "John Doe",
  age: 30,
  email: "john@example.com"
};

// 对象解构
const { name, age } = user;
console.log(\`Name: \${name}, Age: \${age}\`);

// 对象展开
const updatedUser = {
  ...user,
  age: 31,
  city: "New York"
};
console.log("Updated user:", updatedUser);

// Object.keys, values, entries
console.log("Keys:", Object.keys(user));
console.log("Values:", Object.values(user));
console.log("Entries:", Object.entries(user));

// 可选链和空值合并
const phone = user?.phone ?? "Not provided";
console.log("Phone:", phone);`,
      },
      function: {
        label: "函数编程",
        code: `// 函数编程示例
// 高阶函数
function withLogging(fn) {
  return function(...args) {
    console.log("Calling function with args:", args);
    const result = fn(...args);
    console.log("Result:", result);
    return result;
  };
}

// 柯里化
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return function(...moreArgs) {
      return curried.apply(this, args.concat(moreArgs));
    };
  };
}

// 使用示例
const add = (a, b) => a + b;
const curriedAdd = curry(add);

const addWithLogging = withLogging(add);
console.log(addWithLogging(5, 3));

console.log(curriedAdd(2)(3));`,
      },
    },
    python: {
      hello: {
        label: "Hello World",
        code: `print("Hello, World!")`,
      },
      class: {
        label: "类定义",
        code: `class MyClass:
    """一个简单的类示例"""
    
    def __init__(self, name):
        """初始化方法"""
        self.name = name
        self.created_at = datetime.now()
    
    def greet(self):
        """问候方法"""
        print(f"Hello, {self.name}!")
    
    def get_info(self):
        """获取信息方法"""
        return {
            'name': self.name,
            'created_at': self.created_at.isoformat()
        }
    
    def __str__(self):
        """字符串表示"""
        return f"MyClass(name='{self.name}')"

# 使用示例
from datetime import datetime
my_instance = MyClass("Developer")
my_instance.greet()
print(my_instance.get_info())
print(my_instance)`,
      },
      async: {
        label: "异步函数",
        code: `import asyncio
import aiohttp

# 异步函数示例
async def fetch_data(url):
    """异步获取数据"""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as response:
                response.raise_for_status()
                data = await response.json()
                return data
    except Exception as e:
        print(f"Fetch error: {e}")
        raise

# 批量异步请求
async def fetch_multiple(urls):
    """并发获取多个URL的数据"""
    try:
        tasks = [fetch_data(url) for url in urls]
        results = await asyncio.gather(*tasks)
        return results
    except Exception as e:
        print(f"Batch fetch error: {e}")
        raise

# 使用示例
async def main():
    urls = [
        'https://api.example.com/users',
        'https://api.example.com/posts',
        'https://api.example.com/comments'
    ]
    results = await fetch_multiple(urls)
    print(results)

# 运行异步代码
# asyncio.run(main())`,
      },
      list: {
        label: "列表操作",
        code: `# 列表操作示例
numbers = [1, 2, 3, 4, 5]

# 列表推导式
doubled = [n * 2 for n in numbers]
print(f"Doubled: {doubled}")

# 过滤列表
evens = [n for n in numbers if n % 2 == 0]
print(f"Evens: {evens}")

# map 和 filter 函数
from functools import reduce

# 累加
total = reduce(lambda x, y: x + y, numbers, 0)
print(f"Sum: {total}")

# 列表方法
numbers.append(6)
numbers.extend([7, 8])
numbers.insert(0, 0)

# 切片操作
print(f"First 3: {numbers[:3]}")
print(f"Last 3: {numbers[-3:]}")
print(f"Every 2nd: {numbers[::2]}")

# 排序
sorted_desc = sorted(numbers, reverse=True)
print(f"Sorted descending: {sorted_desc}")`,
      },
      dict: {
        label: "字典操作",
        code: `# 字典操作示例
user = {
    'name': 'John Doe',
    'age': 30,
    'email': 'john@example.com'
}

# 字典解构
name = user.get('name', 'Unknown')
age = user.get('age', 0)
print(f"Name: {name}, Age: {age}")

# 字典方法
print(f"Keys: {list(user.keys())}")
print(f"Values: {list(user.values())}")
print(f"Items: {list(user.items())}")

# 字典推导式
squared = {x: x**2 for x in range(5)}
print(f"Squared: {squared}")

# 嵌套字典
users = {
    1: {'name': 'Alice', 'age': 25},
    2: {'name': 'Bob', 'age': 30},
}
print(f"User 1: {users[1]['name']}")

# 字典合并
extra_info = {'city': 'New York', 'country': 'USA'}
merged_user = {**user, **extra_info}
print(f"Merged: {merged_user}")`,
      },
      decorator: {
        label: "装饰器",
        code: `# 装饰器示例
def timing_decorator(func):
    """测量函数执行时间的装饰器"""
    import time
    
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        print(f"{func.__name__} took {end - start:.4f} seconds")
        return result
    return wrapper

def log_decorator(func):
    """记录函数调用的装饰器"""
    def wrapper(*args, **kwargs):
        print(f"Calling {func.__name__} with args: {args}, kwargs: {kwargs}")
        result = func(*args, **kwargs)
        print(f"{func.__name__} returned: {result}")
        return result
    return wrapper

# 使用装饰器
@timing_decorator
@log_decorator
def slow_function(n):
    """一个慢速函数"""
    total = 0
    for i in range(n):
        total += i
    return total

# 调用带装饰器的函数
result = slow_function(1000000)
print(f"Result: {result}")`,
      },
    },
    java: {
      hello: {
        label: "Hello World",
        code: `public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
      },
      class: {
        label: "类定义",
        code: `public class Person {
    private String name;
    private int age;
    private String email;
    
    // 构造函数
    public Person(String name, int age) {
        this.name = name;
        this.age = age;
        this.email = null;
    }
    
    // 全参数构造函数
    public Person(String name, int age, String email) {
        this.name = name;
        this.age = age;
        this.email = email;
    }
    
    // Getter 和 Setter 方法
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public int getAge() {
        return age;
    }
    
    public void setAge(int age) {
        this.age = age;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    // 实例方法
    public void greet() {
        System.out.println("Hello, " + name + "!");
    }
    
    public String getInfo() {
        return String.format("Name: %s, Age: %d, Email: %s", 
            name, age, email != null ? email : "Not provided");
    }
    
    // 静态方法
    public static Person createDefault() {
        return new Person("Anonymous", 0);
    }
    
    // 重写 toString 方法
    @Override
    public String toString() {
        return String.format("Person{name='%s', age=%d}", name, age);
    }
}

// 使用示例
public class Main {
    public static void main(String[] args) {
        Person person = new Person("John Doe", 30, "john@example.com");
        person.greet();
        System.out.println(person.getInfo());
        System.out.println(person);
        
        Person defaultPerson = Person.createDefault();
        System.out.println(defaultPerson);
    }
}`,
      },
      interface: {
        label: "接口定义",
        code: `// 接口定义
public interface Greeter {
    // 接口方法（默认为 public abstract）
    void greet();
    String getGreetingMessage();
}

public interface Worker {
    void work();
    String getJobTitle();
}

// 实现多个接口
public class Employee implements Greeter, Worker {
    private String name;
    private String jobTitle;
    
    public Employee(String name, String jobTitle) {
        this.name = name;
        this.jobTitle = jobTitle;
    }
    
    // 实现 Greeter 接口
    @Override
    public void greet() {
        System.out.println("Hello, I'm " + name);
    }
    
    @Override
    public String getGreetingMessage() {
        return String.format("Hello, I'm %s, a %s", name, jobTitle);
    }
    
    // 实现 Worker 接口
    @Override
    public void work() {
        System.out.println(name + " is working as a " + jobTitle);
    }
    
    @Override
    public String getJobTitle() {
        return jobTitle;
    }
}

// 使用示例
public class Main {
    public static void main(String[] args) {
        Employee employee = new Employee("Alice", "Developer");
        employee.greet();
        employee.work();
        System.out.println(employee.getGreetingMessage());
    }
}`,
      },
      collection: {
        label: "集合操作",
        code: `import java.util.*;

public class CollectionExample {
    public static void main(String[] args) {
        // List 示例
        List<String> names = new ArrayList<>();
        names.add("Alice");
        names.add("Bob");
        names.add("Charlie");
        
        System.out.println("List: " + names);
        System.out.println("First: " + names.get(0));
        System.out.println("Size: " + names.size());
        
        // 遍历 List
        for (String name : names) {
            System.out.println("Name: " + name);
        }
        
        // Set 示例
        Set<Integer> numbers = new HashSet<>();
        numbers.add(1);
        numbers.add(2);
        numbers.add(3);
        numbers.add(2); // 重复元素不会被添加
        
        System.out.println("\\nSet: " + numbers);
        
        // Map 示例
        Map<String, Integer> scores = new HashMap<>();
        scores.put("Alice", 95);
        scores.put("Bob", 87);
        scores.put("Charlie", 92);
        
        System.out.println("\\nMap: " + scores);
        System.out.println("Alice's score: " + scores.get("Alice"));
        
        // 遍历 Map
        for (Map.Entry<String, Integer> entry : scores.entrySet()) {
            System.out.println(entry.getKey() + ": " + entry.getValue());
        }
        
        // Stream API 示例
        List<Integer> numbersList = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
        
        int sum = numbersList.stream()
            .filter(n -> n % 2 == 0)
            .mapToInt(n -> n * 2)
            .sum();
        
        System.out.println("\\nSum of doubled evens: " + sum);
        
        List<String> filteredNames = names.stream()
            .filter(name -> name.startsWith("A") || name.startsWith("C"))
            .map(String::toUpperCase)
            .toList();
        
        System.out.println("Filtered names: " + filteredNames);
    }
}`,
      },
      exception: {
        label: "异常处理",
        code: `// 异常处理示例
import java.io.*;
import java.util.Scanner;

public class ExceptionExample {
    
    // 自定义异常
    static class InvalidInputException extends Exception {
        public InvalidInputException(String message) {
            super(message);
        }
    }
    
    // 可能抛出异常的方法
    public static int divide(int a, int b) throws ArithmeticException {
        if (b == 0) {
            throw new ArithmeticException("Cannot divide by zero");
        }
        return a / b;
    }
    
    // 抛出自定义异常
    public static void validateAge(int age) throws InvalidInputException {
        if (age < 0 || age > 150) {
            throw new InvalidInputException("Invalid age: " + age);
        }
    }
    
    public static void main(String[] args) {
        // try-catch-finally 示例
        try {
            int result = divide(10, 2);
            System.out.println("Result: " + result);
            
            validateAge(25);
            System.out.println("Age is valid");
            
        } catch (ArithmeticException e) {
            System.err.println("Arithmetic error: " + e.getMessage());
        } catch (InvalidInputException e) {
            System.err.println("Validation error: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("Unexpected error: " + e.getMessage());
        } finally {
            System.out.println("Finally block always executes");
        }
        
        // 多个 catch 块
        try {
            int[] numbers = {1, 2, 3};
            System.out.println(numbers[5]); // 会抛出 ArrayIndexOutOfBoundsException
        } catch (ArrayIndexOutOfBoundsException e) {
            System.err.println("Array index out of bounds: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("General exception: " + e.getMessage());
        }
        
        // try-with-resources 示例
        try (Scanner scanner = new Scanner(System.in)) {
            System.out.println("Enter a number:");
            int number = scanner.nextInt();
            System.out.println("You entered: " + number);
        } catch (Exception e) {
            System.err.println("Input error: " + e.getMessage());
        }
    }
}`,
      },
    },
    go: {
      hello: {
        label: "Hello World",
        code: `package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}`,
      },
      struct: {
        label: "结构体定义",
        code: `package main

import (
    "fmt"
    "time"
)

// 定义结构体
type Person struct {
    Name      string
    Age       int
    Email     string
    CreatedAt time.Time
}

// 构造函数
func NewPerson(name string, age int) *Person {
    return &Person{
        Name:      name,
        Age:       age,
        CreatedAt: time.Now(),
    }
}

// 方法（值接收者）
func (p Person) Greet() {
    fmt.Printf("Hello, %s!\\n", p.Name)
}

// 方法（指针接收者）
func (p *Person) HaveBirthday() {
    p.Age++
}

func (p *Person) UpdateEmail(email string) {
    p.Email = email
}

func (p Person) GetInfo() string {
    return fmt.Sprintf("Name: %s, Age: %d, Email: %s",
        p.Name, p.Age, p.Email)
}

// 实现 Stringer 接口
func (p Person) String() string {
    return fmt.Sprintf("Person{Name: %q, Age: %d}", p.Name, p.Age)
}

func main() {
    // 使用构造函数
    person := NewPerson("John Doe", 30)
    person.UpdateEmail("john@example.com")
    
    person.Greet()
    fmt.Println(person.GetInfo())
    
    // 调用方法
    person.HaveBirthday()
    fmt.Printf("After birthday: %s\\n", person)
    
    // 直接初始化
    anotherPerson := Person{
        Name:  "Alice",
        Age:   25,
        Email: "alice@example.com",
    }
    fmt.Println(anotherPerson)
}`,
      },
      interface: {
        label: "接口定义",
        code: `package main

import "fmt"

// 定义接口
type Greeter interface {
    Greet()
    GetGreetingMessage() string
}

type Worker interface {
    Work()
    GetJobTitle() string
}

// 组合接口
type Employee interface {
    Greeter
    Worker
    GetID() int
}

// 实现接口
type Manager struct {
    ID       int
    Name     string
    JobTitle string
}

func (m Manager) Greet() {
    fmt.Printf("Hello, I'm %s\\n", m.Name)
}

func (m Manager) GetGreetingMessage() string {
    return fmt.Sprintf("Hello, I'm %s, a %s", m.Name, m.JobTitle)
}

func (m Manager) Work() {
    fmt.Printf("%s is managing the team\\n", m.Name)
}

func (m Manager) GetJobTitle() string {
    return m.JobTitle
}

func (m Manager) GetID() int {
    return m.ID
}

// 使用接口作为函数参数
func ProcessEmployee(e Employee) {
    e.Greet()
    e.Work()
    fmt.Printf("ID: %d, Message: %s\\n", e.GetID(), e.GetGreetingMessage())
}

// 空接口（可接受任何类型）
func PrintAny(v interface{}) {
    fmt.Printf("Value: %v, Type: %T\\n", v, v)
}

// 类型断言
func Describe(v interface{}) {
    switch t := v.(type) {
    case string:
        fmt.Printf("String: %s\\n", t)
    case int:
        fmt.Printf("Integer: %d\\n", t)
    case Manager:
        fmt.Printf("Manager: %s\\n", t.Name)
    default:
        fmt.Printf("Unknown type: %T\\n", t)
    }
}

func main() {
    manager := Manager{ID: 1, Name: "Alice", JobTitle: "Manager"}
    
    // 作为接口使用
    ProcessEmployee(manager)
    
    // 空接口示例
    PrintAny("Hello")
    PrintAny(42)
    PrintAny(manager)
    
    // 类型断言示例
    Describe("Hello")
    Describe(42)
    Describe(manager)
}`,
      },
      goroutine: {
        label: "并发编程",
        code: `package main

import (
    "fmt"
    "sync"
    "time"
)

// 使用 channel 进行通信
func worker(id int, jobs <-chan int, results chan<- int, wg *sync.WaitGroup) {
    defer wg.Done()
    
    for job := range jobs {
        fmt.Printf("Worker %d processing job %d\\n", id, job)
        time.Sleep(100 * time.Millisecond) // 模拟工作
        results <- job * 2
    }
}

func producer(jobs chan<- int, count int) {
    for i := 1; i <= count; i++ {
        jobs <- i
        fmt.Printf("Produced job %d\\n", i)
    }
    close(jobs)
}

func consumer(results <-chan int, done chan<- bool) {
    for result := range results {
        fmt.Printf("Consumed result: %d\\n", result)
    }
    done <- true
}

// 使用 WaitGroup 等待多个 goroutine
func processWithWaitGroup() {
    var wg sync.WaitGroup
    data := []int{1, 2, 3, 4, 5}
    
    for i, num := range data {
        wg.Add(1)
        go func(index int, value int) {
            defer wg.Done()
            fmt.Printf("Goroutine %d processing %d\\n", index, value)
            time.Sleep(50 * time.Millisecond)
            fmt.Printf("Goroutine %d finished\\n", index)
        }(i, num)
    }
    
    wg.Wait()
    fmt.Println("All goroutines finished")
}

// 使用 Mutex 保护共享资源
type Counter struct {
    mu    sync.Mutex
    value int
}

func (c *Counter) Increment() {
    c.mu.Lock()
    defer c.mu.Unlock()
    c.value++
}

func (c *Counter) GetValue() int {
    c.mu.Lock()
    defer c.mu.Unlock()
    return c.value
}

func main() {
    fmt.Println("=== Channel Example ===")
    
    jobs := make(chan int, 10)
    results := make(chan int, 10)
    done := make(chan bool)
    
    // 启动生产者
    go producer(jobs, 5)
    
    // 启动消费者
    go consumer(results, done)
    
    // 启动多个 worker
    var wg sync.WaitGroup
    for i := 1; i <= 3; i++ {
        wg.Add(1)
        go worker(i, jobs, results, &wg)
    }
    
    // 等待所有 worker 完成
    wg.Wait()
    close(results)
    
    // 等待消费者完成
    <-done
    
    fmt.Println("\\n=== WaitGroup Example ===")
    processWithWaitGroup()
    
    fmt.Println("\\n=== Mutex Example ===")
    counter := &Counter{}
    
    for i := 0; i < 10; i++ {
        go counter.Increment()
    }
    
    time.Sleep(100 * time.Millisecond)
    fmt.Printf("Final counter value: %d\\n", counter.GetValue())
}`,
      },
      slice: {
        label: "切片操作",
        code: `package main

import (
    "fmt"
    "sort"
)

func main() {
    // 创建切片
    numbers := []int{1, 2, 3, 4, 5}
    fmt.Println("Original:", numbers)
    
    // 添加元素
    numbers = append(numbers, 6, 7, 8)
    fmt.Println("After append:", numbers)
    
    // 切片操作
    fmt.Println("First 3:", numbers[:3])
    fmt.Println("Last 3:", numbers[len(numbers)-3:])
    fmt.Println("Middle:", numbers[2:5])
    
    // 遍历切片
    fmt.Println("\\nIterating with index:")
    for i, num := range numbers {
        fmt.Printf("Index %d: %d\\n", i, num)
    }
    
    // 删除元素
    index := 2
    numbers = append(numbers[:index], numbers[index+1:]...)
    fmt.Println("\\nAfter deleting index 2:", numbers)
    
    // 排序
    unsorted := []int{3, 1, 4, 1, 5, 9, 2, 6}
    sort.Ints(unsorted)
    fmt.Println("Sorted:", unsorted)
    
    // 切片的切片
    slice := make([]int, 5)
    copy(slice, numbers[:5])
    fmt.Println("\\nCopied slice:", slice)
    
    // 动态切片
    dynamic := []int{}
    for i := 0; i < 5; i++ {
        dynamic = append(dynamic, i*i)
    }
    fmt.Println("Dynamic slice:", dynamic)
    
    // 多维切片
    matrix := [][]int{
        {1, 2, 3},
        {4, 5, 6},
        {7, 8, 9},
    }
    fmt.Println("\\nMatrix:")
    for _, row := range matrix {
        fmt.Println(row)
    }
    
    // 使用 make 创建切片
    s1 := make([]int, 5)  // 长度为 5，容量为 5
    s2 := make([]int, 3, 10) // 长度为 3，容量为 10
    
    fmt.Printf("s1: len=%d, cap=%d\\n", len(s1), cap(s1))
    fmt.Printf("s2: len=%d, cap=%d\\n", len(s2), cap(s2))
}`,
      },
    },
    typescript: {
      hello: {
        label: "Hello World",
        code: `console.log("Hello, TypeScript!");`,
      },
      interface: {
        label: "接口定义",
        code: `interface User {
  id: number;
  name: string;
  email: string;
}

class UserService {
  private users: User[] = [];
  
  addUser(user: User): void {
    this.users.push(user);
  }
  
  getUserById(id: number): User | undefined {
    return this.users.find(user => user.id === id);
  }
  
  getAllUsers(): User[] {
    return this.users;
  }
}

// 使用示例
const service = new UserService();
service.addUser({ id: 1, name: "Alice", email: "alice@example.com" });
service.addUser({ id: 2, name: "Bob", email: "bob@example.com" });

console.log("所有用户:", service.getAllUsers());
console.log("查找用户ID=1:", service.getUserById(1));`,
      },
      generic: {
        label: "泛型函数",
        code: `function identity<T>(arg: T): T {
  return arg;
}

const num = identity<number>(42);
const str = identity<string>("Hello");
const arr = identity<number[]>([1, 2, 3]);

console.log("数字:", num);
console.log("字符串:", str);
console.log("数组:", arr);

// 泛型接口
interface Box<T> {
  value: T;
}

const numberBox: Box<number> = { value: 100 };
const stringBox: Box<string> = { value: "TypeScript" };

console.log("数字盒子:", numberBox.value);
console.log("字符串盒子:", stringBox.value);`,
      },
      async: {
        label: "异步函数",
        code: `// 异步函数示例
async function fetchData(url: string): Promise<any> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
}

// Promise.all 示例
async function fetchMultiple(urls: string[]): Promise<any[]> {
  try {
    const promises = urls.map(url => fetch(url).then(res => res.json()));
    const results = await Promise.all(promises);
    return results;
  } catch (error) {
    console.error("Batch fetch error:", error);
    throw error;
  }
}

// 使用示例
async function main() {
  try {
    // 模拟 API 调用
    console.log("开始异步操作...");
    
    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log("异步操作完成");
  } catch (error) {
    console.error("Main error:", error);
  }
}

main();`,
      },
    },
    cpp: {
      hello: {
        label: "Hello World",
        code: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`,
      },
      class: {
        label: "类定义",
        code: `#include <iostream>
#include <string>

class Rectangle {
private:
    double width;
    double height;

public:
    Rectangle(double w, double h) : width(w), height(h) {}
    
    double area() const {
        return width * height;
    }
    
    double perimeter() const {
        return 2 * (width + height);
    }
    
    void setDimensions(double w, double h) {
        width = w;
        height = h;
    }
    
    void display() const {
        cout << "Rectangle: " << width << " x " << height << endl;
        cout << "Area: " << area() << endl;
        cout << "Perimeter: " << perimeter() << endl;
    }
};

int main() {
    Rectangle rect1(5.0, 3.0);
    rect1.display();
    
    Rectangle rect2(7.0, 4.0);
    rect2.display();
    
    return 0;
}`,
      },
      stl: {
        label: "STL 容器",
        code: `#include <iostream>
#include <vector>
#include <algorithm>
#include <string>

using namespace std;

int main() {
    // vector 示例
    vector<int> numbers = {5, 2, 8, 1, 9};
    
    cout << "原始数组: ";
    for (int num : numbers) {
        cout << num << " ";
    }
    cout << endl;
    
    // 排序
    sort(numbers.begin(), numbers.end());
    
    cout << "排序后: ";
    for (int num : numbers) {
        cout << num << " ";
    }
    cout << endl;
    
    // 查找
    auto it = find(numbers.begin(), numbers.end(), 5);
    if (it != numbers.end()) {
        cout << "找到数字 5" << endl;
    }
    
    // string 示例
    string text = "Hello C++ STL";
    cout << "字符串: " << text << endl;
    cout << "长度: " << text.length() << endl;
    
    return 0;
}`,
      },
      pointer: {
        label: "指针操作",
        code: `#include <iostream>

using namespace std;

int main() {
    int num = 42;
    int *ptr = &num;
    int **ptrToPtr = &ptr;
    
    cout << "值: " << num << endl;
    cout << "地址: " << &num << endl;
    cout << "指针指向的值: " << *ptr << endl;
    cout << "指针本身的地址: " << ptr << endl;
    cout << "二级指针指向的值: " << **ptrToPtr << endl;
    
    // 动态内存分配
    int *dynamicArray = new int[5];
    for (int i = 0; i < 5; i++) {
        dynamicArray[i] = i * 10;
    }
    
    cout << "动态数组: ";
    for (int i = 0; i < 5; i++) {
        cout << dynamicArray[i] << " ";
    }
    cout << endl;
    
    delete[] dynamicArray;
    
    return 0;
}`,
      },
    },
    c: {
      hello: {
        label: "Hello World",
        code: `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`,
      },
      struct: {
        label: "结构体",
        code: `#include <stdio.h>
#include <string.h>

struct Person {
    char name[50];
    int age;
    float height;
};

void printPerson(struct Person p) {
    printf("Name: %s\\n", p.name);
    printf("Age: %d\\n", p.age);
    printf("Height: %.2f\\n", p.height);
}

int main() {
    struct Person p1;
    strcpy(p1.name, "John Doe");
    p1.age = 30;
    p1.height = 1.75;
    
    printf("Person 1:\\n");
    printPerson(p1);
    
    struct Person p2 = {"Jane Smith", 25, 1.68};
    printf("\\nPerson 2:\\n");
    printPerson(p2);
    
    return 0;
}`,
      },
      pointer: {
        label: "指针操作",
        code: `#include <stdio.h>

int main() {
    int num = 42;
    int *ptr = &num;
    int **ptrToPtr = &ptr;
    
    printf("值: %d\\n", num);
    printf("地址: %p\\n", (void*)&num);
    printf("指针指向的值: %d\\n", *ptr);
    printf("指针本身的地址: %p\\n", (void*)ptr);
    printf("二级指针指向的值: %d\\n", **ptrToPtr);
    
    // 数组指针
    int arr[5] = {10, 20, 30, 40, 50};
    int *arrPtr = arr;
    
    printf("\\n数组元素:\\n");
    for (int i = 0; i < 5; i++) {
        printf("arr[%d] = %d (地址: %p)\\n", i, *(arrPtr + i), (void*)(arrPtr + i));
    }
    
    return 0;
}`,
      },
      array: {
        label: "数组操作",
        code: `#include <stdio.h>

#define SIZE 5

int main() {
    // 数组声明和初始化
    int numbers[SIZE] = {1, 2, 3, 4, 5};
    
    printf("数组元素:\\n");
    for (int i = 0; i < SIZE; i++) {
        printf("numbers[%d] = %d\\n", i, numbers[i]);
    }
    
    // 计算总和
    int sum = 0;
    for (int i = 0; i < SIZE; i++) {
        sum += numbers[i];
    }
    printf("\\n总和: %d\\n", sum);
    
    // 查找最大值
    int max = numbers[0];
    for (int i = 1; i < SIZE; i++) {
        if (numbers[i] > max) {
            max = numbers[i];
        }
    }
    printf("最大值: %d\\n", max);
    
    return 0;
}`,
      },
    },
    ruby: {
      hello: {
        label: "Hello World",
        code: `puts "Hello, Ruby!"`,
      },
      class: {
        label: "类定义",
        code: `class Person
  attr_accessor :name, :age
  
  def initialize(name, age)
    @name = name
    @age = age
  end
  
  def introduce
    puts "Hello, I'm #{@name}, #{@age} years old."
  end
  
  def birthday
    @age += 1
    puts "Happy birthday! Now #{@age} years old."
  end
  
  def to_s
    "Person(name: #{@name}, age: #{@age})"
  end
end

# 创建实例
person1 = Person.new("Alice", 25)
person1.introduce
person1.birthday

person2 = Person.new("Bob", 30)
person2.introduce

puts "\\nPerson info: #{person1}"
puts "Person info: #{person2}"`,
      },
      block: {
        label: "块和迭代器",
        code: `# 数组迭代
numbers = [1, 2, 3, 4, 5]

puts "原始数组: #{numbers.inspect}"

# map - 转换数组
squared = numbers.map { |n| n ** 2 }
puts "平方: #{squared.inspect}"

# select - 过滤数组
evens = numbers.select { |n| n.even? }
puts "偶数: #{evens.inspect}"

# reject - 排除元素
odds = numbers.reject { |n| n.even? }
puts "奇数: #{odds.inspect}"

# reduce - 累加
sum = numbers.reduce(0) { |acc, n| acc + n }
puts "总和: #{sum}"

# each - 遍历
puts "遍历:"
numbers.each do |n|
  puts "  #{n}"
end

# 哈希操作
person = { name: "Charlie", age: 28, city: "NYC" }

puts "\\n哈希信息:"
person.each do |key, value|
  puts "  #{key}: #{value}"
end`,
      },
      string: {
        label: "字符串操作",
        code: `# 字符串操作
text = "Hello, Ruby World"

puts "原始字符串: #{text}"
puts "长度: #{text.length}"
puts "大写: #{text.upcase}"
puts "小写: #{text.downcase}"
puts "反转: #{text.reverse}"

# 字符串分割
words = text.split(", ")
puts "分割结果: #{words.inspect}"

# 字符串插值
name = "Ruby"
version = "3.0"
message = "Welcome to #{name} #{version}!"
puts "插值结果: #{message}"

# 正则表达式匹配
if text =~ /Ruby/
  puts "字符串包含 'Ruby'"
end

# 替换
new_text = text.gsub("Ruby", "Python")
puts "替换结果: #{new_text}"`,
      },
    },
  };

  /**
   * 获取指定语言的代码模板
   * @param {string} language - 编程语言 (javascript|python|java|go|typescript|cpp|c|ruby)
   * @returns {Object} 代码模板对象
   */
  function getTemplates(language) {
    return codeTemplates[language] || {};
  }

  /**
   * 获取指定语言的模板列表
   * @param {string} language - 编程语言
   * @returns {Array} 模板选项数组
   */
  function getTemplateOptions(language) {
    const templates = getTemplates(language);
    return Object.keys(templates).map((key) => ({
      value: key,
      label: templates[key].label,
      code: templates[key].code,
    }));
  }

  /**
   * 生成指定模板的代码
   * @param {string} language - 编程语言
   * @param {string} templateKey - 模板键名
   * @returns {string} 生成的代码
   */
  function generateCode(language, templateKey) {
    const templates = getTemplates(language);
    if (!templates[templateKey]) {
      throw new Error(`模板 ${templateKey} 在语言 ${language} 中不存在`);
    }
    return templates[templateKey].code;
  }

  /**
   * 判断是否支持代码生成
   * @param {string} language - 编程语言
   * @returns {boolean} 是否支持
   */
  function supportsCodeGeneration(language) {
    return codeTemplates.hasOwnProperty(language);
  }

  /**
   * 获取所有支持代码生成的语言
   * @returns {Array} 语言数组
   */
  function getSupportedLanguages() {
    return Object.keys(codeTemplates);
  }

  return {
    codeTemplates,
    getTemplates,
    getTemplateOptions,
    generateCode,
    supportsCodeGeneration,
    getSupportedLanguages,
  };
}
