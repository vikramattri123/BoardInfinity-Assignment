
function ensureRange(arr, n) {
    var err = 'Not a range of length ' + n + ': ' + arr.join(',');
    if(arr.length !== n) {
        throw new Error(err + ' (Invalid length)');
    }
    for (var i = 1; i <= n; i++) {
        if(i !== arr[i-1]){
            throw new Error(err + ' (Invalid ' + i + ' element)');
        }
    }
}

function assert(x, s){
    if(!x){
        throw new Error('Assert failed: ' + s);
    }
}

function fail(msg) {
    throw new Error(msg || 'fail()');
}

describe('ensureRange', function() {
    it('works', function(){
        ensureRange([], 0);
        ensureRange([1,2,3,4], 4);
    });
});


[true, false].forEach(function(enableFastTimeouts){


describe('waitAsync ' + (enableFastTimeouts ? 'with' : 'without') + ' fastTimeouts', function(){
    this.timeout(50000);

    before(function() {
        waitAsync.fastTimeouts = enableFastTimeouts;
    });

    it('Calls all setTimeouts', function(done){
        var range = [];
        waitAsync(function(){
            range.push(1);
            setTimeout(function(){
                range.push(2);
                setTimeout(function(){
                    range.push(3);
                }, 100);
            }, 100);
        }, function(){
            range.push(4);
            ensureRange(range, 4);
            done();
        });
    });

    it('Multiple setTimeouts are executed in order', function(done){
        var range = [];
        waitAsync(function(){
            range.push(1);

            setTimeout(function(){ range.push(5); }, 400);
            setTimeout(function(){ range.push(2); }, 100);
            setTimeout(function(){ range.push(4); }, 300);
            setTimeout(function(){ range.push(3); }, 200);

        }, function(){
            ensureRange(range, 5);
            done();
        });
    });

    it('If timeouts have the same timeout, the first one wins', function(done){
        var range = [];
        waitAsync(function(){
            setTimeout(function(){ range.push(5); }, 200);
            setTimeout(function(){ range.push(6); }, 200);

            setTimeout(function(){ range.push(1); }, 100);
            setTimeout(function(){ range.push(2); }, 100);
            setTimeout(function(){ range.push(3); }, 150);
            setTimeout(function(){ range.push(4); }, 150);
        }, function(){
            ensureRange(range, 6);
            done();
        });
    });

    it('Nested setTimeouts are executed in order', function(done){
        var range = [];
        waitAsync(function(){
            range.push(1);

            setTimeout(function(){
                range.push(2);

                setTimeout(function(){
                    range.push(3);
                }, 50);

                setTimeout(function(){
                    range.push(5);
                }, 150);

            }, 100);

            setTimeout(function(){
                range.push(4);
            }, 200);

        }, function(){
            ensureRange(range, 5);
            done();
        });
    });

    it('Clearing all timeouts makes the context finish', function(done){
        var range = [];
        waitAsync(function(){
            var norun1 = setTimeout(function(){ range.push(99); }, 0);
            var norun2 = setTimeout(function(){ range.push(99); }, 300);
            clearInterval(norun1);
            clearInterval(norun2);
        }, function(){
            ensureRange(range, 0);
            done();
        });
    });

    it('Momemtarilly having no running timeouts still runs later timeouts', function(done){
        var range = [];
        waitAsync(function(){
            var norun1 = setTimeout(function(){ range.push(99); }, 0);
            clearInterval(norun1);
            setTimeout(function(){
                range.push(1);
                var norun2 = setTimeout(function(){ range.push(99); }, 0);
                clearInterval(norun2);

                setTimeout(function(){
                    range.push(2);
                }, 100);
            }, 100);
        }, function(){
            ensureRange(range, 2);
            done();
        });
    });

    it('Clearing a timeout from itself', function(done){
        var range = [];
        waitAsync(function(){

            setTimeout(function(){ range.push(2); }, 200);

            var tid = setTimeout(function(){
                clearTimeout(tid);
                range.push(1);
                var tid2 = setTimeout(function(){
                    clearTimeout(tid2);
                    range.push(3);
                }, 101);
            }, 100);
        }, function(){
            ensureRange(range, 3);
            done();
        });
    });

    it('Can clear timeouts', function(done){
        var range = [];
        waitAsync(function(){
            range.push(1);
            var norun1 = setTimeout(function(){ range.push(99); }, 0);
            var norun2 = setTimeout(function(){ range.push(99); }, 300);
            clearInterval(norun1);
            clearInterval(norun1); // Clearing twice has no effect

            setTimeout(function(){
                range.push(2);
                clearInterval(norun2);
                clearInterval(norun1); // Clearing twice has no effect
                clearInterval(norun2); // Clearing twice has no effect
            }, 100);


        }, function(){
            ensureRange(range, 2);
            done();
        });
    });


    it('Multiple contexts can coexist', function(done){
        var range1 = [];
        var range2 = [];
        var tofinish = 2;

        waitAsync(function(){
            range1.push(1);

            setTimeout(function(){
                range1.push(2);
                setTimeout(function(){ range1.push(3); }, 50);
                setTimeout(function(){ range1.push(5); }, 150);
                setTimeout(function(){ range1.push(6); }, 200);
            }, 100);

            setTimeout(function(){ range1.push(4); }, 200);
        }, function(){
            ensureRange(range1, 6);
            if(--tofinish === 0) done();
        });

        waitAsync(function(){
            range2.push(1);

            setTimeout(function(){
                range2.push(2);
                setTimeout(function(){ range2.push(6); }, 200);
                setTimeout(function(){ range2.push(5); }, 150);
                setTimeout(function(){ range2.push(3); }, 50);
            }, 100);

            setTimeout(function(){ range2.push(4); }, 200);
        }, function(){
            ensureRange(range2, 6);
            if(--tofinish === 0) done();
        });
    });

    it('setInterval works', function(done){
        var range = [];
        waitAsync(function(){
            var i = 0;
            var tid = setInterval(function(){
                range.push(++i);
                if(i === 5) clearInterval(tid);
            }, 20);
        }, function(){
            ensureRange(range, 5);
            done();
        });
    });

    function ajax(url) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url || '/?' + new Date(), true);
        return xhr;
    }

    it('works with ajax', function(done){
        var changes = false;
        var timeout = false;

        waitAsync(function(){
            var xhr = ajax();
            xhr.onreadystatechange = function(){
                changes = true;
                setTimeout(function(){
                    timeout = true;
                }, 100);
            };
            xhr.send();
        }, {
            maxXhr: 1
        }, function(){
            assert(changes, 'Ready state changed');
            assert(timeout, 'Waited for timeout');
            done();
        });
    });

    it('nested ajax', function(done){
        var timeout = false;

        waitAsync(function(){
            var xhr = ajax();
            xhr.onreadystatechange = function(){
                var xhr = ajax();
                xhr.onreadystatechange = function(){
                    setTimeout(function(){
                        timeout = true;
                    }, 100);
                };
                xhr.send();
            };
            xhr.send();
        }, function(){
            assert(timeout, 'Waited for timeout');
            done();
        });
    });

    it('ajax with timeout', function(done){
        var timeout = false;
        waitAsync(function(){
            var tid = setTimeout(function(){
                timeout = true;
                xhr.abort();
            }, 700);

            var xhr = ajax();
            xhr.onload = function(){
                var xhr = ajax();
                xhr.onload = function(){
                    clearTimeout(tid);
                };
                xhr.send();
            };
            xhr.send();
        }, function(){
            assert(!timeout, 'Didn\'t run timeout');
            done();
        });
    });

    it('ajax addEventListener', function(done){
        var ok = false;

        waitAsync(function(){
            var xhr = ajax();
            xhr.addEventListener('readystatechange', function(){
                setTimeout(function(){
                    ok = true;
                }, 100);
            });
            xhr.send();
        }, function(){
            assert(ok, 'Completed');
            done();
        });
    });

    xit('ajax error', function(done){
        var ok = false;

        waitAsync(function(){
            var xhr = ajax('http://someplacewedonthavepermissionandifwehaditdoesntexistanyway.com');
            xhr.addEventListener('error', function(){
                setTimeout(function(){
                    ok = true;
                }, 100);
            });
            xhr.send();
        }, function(){
            assert(ok, 'Completed');
            done();
        });
    });

    it('maxTimeouts', function(done){
        var range = [];
        waitAsync(function(){
            range.push(1);
            setTimeout(function(){ range.push(2); }, 100);
            setTimeout(function(){ range.push(3); }, 200);
            setTimeout(function(){ range.push(4); }, 300);
            setTimeout(function(){ fail(); }, 400); // Won't be ran
        }, {
            maxTimeouts: 3
        }, function(){
            ensureRange(range, 4);
            done();
        });
    });

    it('maxTimeouts nested', function(done){
        var range = [];
        waitAsync(function(){
            range.push(1);

            setTimeout(function(){
                range.push(2);
                setTimeout(function(){ // Won't be ran
                    range.push(3);
                    setTimeout(function(){ // Won't be ran
                        fail();
                    }, 150);
                }, 50);
            }, 100);
        }, {
            maxTimeouts: 2
        }, function(){
            ensureRange(range, 3);
            done();
        });
    });

    it('maxXhr works', function(done){
        waitAsync(function(){
            var xhr = ajax();
            xhr.onload = function(){
                fail();
            };
            xhr.send();
        }, {
            maxXhr: 0
        }, function(){
            done();
        });
    });

    it('maxTimeouts with setInterval', function(done){
        var range = [], i=0;
        waitAsync(function(){
            setInterval(function(){
                range.push(++i);
            }, enableFastTimeouts ? 100000 : 30);
        }, {
            maxTimeouts: 5
        }, function(){
            ensureRange(range, 5);
            done();
        });
    });

});

});
