# plotting weatherdata using matplotlib
# plotted figure is saved

import matplotlib.pyplot as plt
import sys
import datetime

def smooth(data,number):
    # calculates floating average over number of mesurments
    i=1
    new_data=[]
    while i<len(data):
        if i>number:
            tmp=data[slice(i,i-number,-1)]
        else:
            tmp=data[slice(i)]
        new_value=sum(tmp)/len(tmp) #average
        new_data.append(new_value)
        i+=1
    # adding last data part
    new_data.append(sum(data[slice(len(data)-1,len(data)-number,-1)])/(number-1))
    return new_data

def plot(temp,pre,hud):
    # handeling the data
    tl=temp.split(',')
    temps=[]
    pl=pre.split(',')
    press=[]
    hl=hud.split(',')
    huds=[]
    for i in range(0,len(tl)):
        temps.append(float(tl[i]))
        press.append(float(pl[i]))
        huds.append(float(hl[i]))
    
    # unneassessary in latest measuremt insturment configuration
    #tempss=smooth(temps,30)
    #press=smooth(press,200)
    #huds=smooth(huds,30)
    
    # using datetimes in x-axis
    t=[datetime.datetime.now()+datetime.timedelta(minutes=i) for i in range(-len(temps),0)]
    
    fig,ax1 = plt.subplots(figsize=(16,4),dpi=250)
    fig.subplots_adjust(right=0.9,left=0.08)
    
    # plotting temps
    ax1.plot(t,temps,label='lampo')
    ax1.set_xlabel('aika')
    ax1.set_ylabel('lampotila (\xb0C)',color='tab:blue')
    ax1.tick_params(axis='y')

    ax2=ax1.twinx()
    ax2.spines["right"].set_position(("axes",1.05))
    ax2.spines["right"].set_visible(True)
    
    # plotting pressures
    ax2.plot(t,press,label='paine',color='tab:red')
    ax2.set_ylabel('paine (hPa)',color='tab:red')
    ax2.tick_params(axis='y')

    ax3=ax1.twinx()
    
    # plotting humiditis
    ax3.plot(t,huds,label='kosteus',color='tab:green')
    ax3.set_ylabel('kosteus (%)',color='tab:green')
    ax3.tick_params(axis='y')

    plt.gcf().autofmt_xdate() # showing dates neather in x axis
    fig.legend(loc='lower left')
    ax1.grid(axis='y')
    
    # time label for title
    start=datetime.datetime.now()+datetime.timedelta(minutes=-len(temps))
    now=datetime.datetime.now()
    start=start.isoformat(timespec='minutes')
    now=now.isoformat(timespec='minutes')
    plt.title('Mittausdata ' + str(start)+' - '+str(now))

    plt.savefig('figuuri.png')
    
    #plt.show()
    plt.close()

if __name__=='__main__':
    # gets weather data in arguments 
    plot(sys.argv[1],sys.argv[2],sys.argv[3])
