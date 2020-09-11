Detect asynchronous behaviour that was started and wait for it to finish. Optionally, speed up setTimeout when possible.

WaitAsync(fn, [config, ] callback);

It takes two functions, the first function is executed immediately and the second is executed as soon as all the asynchronous behaviour that was started in the first function finishes.

```
function doSomeAsyncStuff(){
    setTimeout(function(){
        console.log(1);
        setTimeout(function(){
            console.log(2);
        }, 100);
    }, 100);
}

waitAsync(function(){
    doSomeAsyncStuff();
}, function(){
    console.log(3);
});
1
2
3
```

It works by monkey-patching setTimeout/setInterval, XMLHttpRequest, the Date object and requestAnimationFrame.

Options
=======

waitAsync.fastTimeouts (default: false): if set to true, and there is no pending XMLHttpRequest setTimeout/setInterval will be run as soon as possible, while still being run in the correct order. This allows skipping over animations and other unnecessary delays.
    timeouts are run back at normal speeds when there are Ajax calls working so that the execution order can be preserved.

config.maxXhr (default: unlimited): Maximum number of XMLHttpRequests allowed to run in the lifetime of the context (after it will silently do nothing)
config.maxTimeouts (default: unlimited): Maximum number of timoeuts allowed to run in the lifetime of the context (after it will silently do nothing)

If both maxXhr and maxTimeouts are set to a finite number, callback is guaranteed to be called.

Uses
====

It's intended use is to facilitate browser automation in headless browsers (e.g. testing or web scraping).

For example, if you are testing a page that has this code:

```
$('#loadData').click(function(){
    $('#loading').animate({ height: '500px'}, function() {
        $.load('data.html', function(data){
            $('#loading').animate({ height: '0px' }, function() {
                $('#result').html(data);
            });
        });
    });
});
```
It's not possible for the tests to know when the data is available in the document without pooling.

With asyncWait, you can be notified when all the asynchronous calls have been completed
```
asyncWait(function(){
    $('#loadData').click();
}, function(){
    // the ajax call and the animations have finished
});
```

Implemented
===========
This asynchronous behaviours are implemented:

- setTimeout / setInterval
- XMLHttpRequest
- requestAnimationFrame

Not Implemented
===============
There are some sources of asynchronous behaviour that are not implemented:

- Subresource onload events
- Run a WebWorker and communicate with it via messages
- Post/receive message from other frames
- WebSockets
- Server sent events
- CSS animation events

