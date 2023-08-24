import time
from tqdm import tqdm

total_tasks = 6
overall_progress_bar = tqdm(total=total_tasks, desc="Overall Progress", position=0)

overall_progress_bar.update(1)
time.sleep(1)

overall_progress_bar.update(1)
time.sleep(2)

overall_progress_bar.update(1)
time.sleep(1)

overall_progress_bar.update(1)
time.sleep(2)

overall_progress_bar.update(1)
time.sleep(1)

overall_progress_bar.update(1)
time.sleep(2)

overall_progress_bar.close()