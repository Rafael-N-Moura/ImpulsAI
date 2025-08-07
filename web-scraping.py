from linkedin_scraper import JobSearch, actions
from selenium import webdriver

driver = webdriver.Chrome()

email  = ""
password = ""

actions.login(driver, email, password)
#input("Press Enter")

job_search = JobSearch(driver=driver, close_on_complete=False, scrape=False)

job_listings = job_search.search("Machine Learning Engineer")

